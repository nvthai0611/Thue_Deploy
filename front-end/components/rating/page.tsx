"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Star, User, Calendar, MessageSquare, Send, AlertCircle, CheckCircle, ShieldX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetAllHouseAreaRating, useAddHousingAreaRating, useAddRatingReply } from "@/queries/housing-area.queries";
import { getUserNameById, useGetOneUser } from "@/queries/user.queries";
import PagingPage from "@/components/pagingation/pagingPage";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import LoginAlert from "../requireLogin/page";

interface Rating {
  _id?: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  avatar_url?: string;
  score: number;
  comment: string;
  status: string;
  created_at: string | Date;
  replies?: {
    role: string;
    content: string;
    created_at: string | Date;
    user_id?: string;
    avatar_url?: string;
  }[];
}

interface ISubmitRating {
  score: number;
  comment: string;
  status: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: { [key: number]: number };
}

interface HousingRatingsProps {
  housingId: any;
}

const HousingRatings: React.FC<HousingRatingsProps> = ({ housingId}) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats>({ average: 0, total: 0, distribution: {} });
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [hasUserRated, setHasUserRated] = useState<boolean>(false);
  const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);
  const [replyOpenIndex, setReplyOpenIndex] = useState<number | null>(null);
  const [replyValue, setReplyValue] = useState<string>("");
  const [currentCommentId, setCurrentCommentId] = useState<string | undefined>("");
  const [role, setRole] = useState<string>("")
  const [isUserVerified, setIsUserVerified] = useState<boolean>(false);
  const userId = useUserStore((state) => state.userId);
  
  // Get user details to check verification status
  const { data: currentUserDetail } = useGetOneUser(userId);

  useEffect(() => {
    const userInfo = localStorage.getItem("user-store");
    if (userInfo) {
      setRole(JSON.parse(userInfo).state.userRole);
    }
  }, []);

  useEffect(() => {
    if (currentUserDetail) {
      setIsUserVerified(currentUserDetail.verified || false);
    }
  }, [currentUserDetail]);

  const { data, error: apiError, isError } = useGetAllHouseAreaRating(housingId, limit, page);
  const { mutate } = useAddHousingAreaRating(housingId);
  const { mutate: Ireply } = useAddRatingReply(housingId, currentCommentId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isError) {
      setError("Failed to load ratings. Please try again later.");
      setRatings([]);
      setStats({ average: 0, total: 0, distribution: {} });
      setIsLoading(false);
    } else if (data) {
      const mappedRatings: Rating[] = data.ratings.map((item: Rating) => ({
        _id: item._id,
        user_id: item.user_id,
        user_name: item.user_id,
        user_avatar: item.avatar_url,
        avatar_url: item.avatar_url,
        score: item.score,
        comment: item.comment,
        status: item.status,
        created_at: item.created_at,
        replies: item.replies,
      }));
      setRatings(mappedRatings);
      calculateStats(data.ratings);
      setHasUserRated(mappedRatings.some((rating) => rating.user_id === userId));
      setIsLoading(false);

      const fetchNames = async () => {
        const userIds = new Set<string>();
        mappedRatings.forEach((rating) => {
          if (rating.user_id) userIds.add(rating.user_id);
          if (rating.replies && Array.isArray(rating.replies)) {
            rating.replies.forEach((reply) => {
              if (reply.user_id) userIds.add(reply.user_id);
            });
          }
        });

        const nameMap: { [userId: string]: string } = { ...userNames };
        await Promise.all(
          Array.from(userIds).map(async (id) => {
            if (!nameMap[id]) {
              const name = await getUserNameById(id);
              if (name) nameMap[id] = name;
            }
          })
        );
        setUserNames(nameMap);
      };
      fetchNames();
    } else {
      setRatings([]);
      setStats({ average: 0, total: 0, distribution: {} });
      setIsLoading(false);
    }
  }, [data, isError, userId, housingId]);

  const calculateStats = (ratingsData: Rating[]) => {
    if (!Array.isArray(ratingsData)) {
      setStats({ average: 0, total: 0, distribution: {} });
      return;
    }

    const approvedRatings = ratingsData.filter((r) => r.status === "approved");
    const total = approvedRatings.length;
    const sum = approvedRatings.reduce((acc, rating) => acc + rating.score, 0);
    const average = total > 0 ? sum / total : 0;

    const distribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = approvedRatings.filter((r) => r.score === i).length;
    }

    setStats({ average, total, distribution });
  };

  const handleStarClick = (rating: number) => {
    setUserRating(rating);
    setError("");
  };

  const handleStarHover = (rating: number) => {
    setHoveredStar(rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (userRating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Please provide a comment with at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const newRating: ISubmitRating = {
        score: userRating,
        comment: comment.trim(),
        status: "approved",
      };
      mutate(newRating, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["housingArea", housingId] });
          setHasUserRated(true);
          setSuccess("Your rating has been posted");
          setUserRating(0);
          setComment("");
        },
      });
    } catch (err) {
      setError("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${interactive ? "cursor-pointer" : ""} ${
              star <= (interactive ? hoveredStar || userRating : rating)
                ? "fill-red-500 text-red-500"
                : "text-gray-300"
            } transition-colors`}
            onClick={interactive ? () => handleStarClick(star) : undefined}
            onMouseEnter={interactive ? () => handleStarHover(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {role == "landlord" ? 
           <div className="max-w-4xl mx-auto p-6 text-center">
  <div className="flex justify-center items-center gap-2">
    <User className="w-6 h-6 text-red-500" />
    <h1 className="text-lg font-semibold text-gray-900 text-center">Reviews from Tenants</h1>
  </div>
  <p className="mt-2 text-sm text-gray-700">
    See what tenants have to say about their experiences in this housing area.
  </p>
</div>
:""}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-red-500" />
            Area Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats.average.toFixed(1)}</div>
                <div className="flex justify-center mb-2">{renderStars(Math.round(stats.average), false, "lg")}</div>
                <p className="text-gray-600">
                  Based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{rating}</span>
                  <Star className="w-4 h-4 fill-red-500 text-red-500" />
                  <Progress
                    value={stats.total > 0 ? (stats.distribution[rating] / stats.total) * 100 : 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-gray-600 w-8 text-right">{stats.distribution[rating] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

{!userId ? (
  <LoginAlert />
) : role === "landlord" ? (
  ""
) : role !== "user" ? (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <ShieldX className="w-12 h-12 text-orange-500 mb-4" />
      <p className="text-lg font-medium text-gray-900">Only regular users can leave reviews</p>
      <p className="text-sm text-gray-500 mt-2">Landlords and admins cannot review housing areas</p>
    </CardContent>
  </Card>
) : !isUserVerified ? (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <ShieldX className="w-12 h-12 text-orange-500 mb-4" />
      <p className="text-lg font-medium text-gray-900">Account verification required</p>
      <p className="text-sm text-gray-500 mt-2">Please verify your account before leaving a review</p>
    </CardContent>
  </Card>
) : !hasUserRated ? (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-red-500" />
        Share Your Experience
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex items-center gap-2">
                  {renderStars(userRating, true, "lg")}
                  {userRating > 0 && (
                    <span className="text-sm text-gray-600 ml-2">{userRating} out of 5 stars</span>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts about this area..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters ({comment.length}/10)</p>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || userRating === 0 || comment.trim().length < 10}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </form>
    </CardContent>
  </Card>
) : (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
      <p className="text-lg font-medium text-gray-900">You have already rated this housing area</p>
      <p className="text-sm text-gray-500 mt-2">Thank you for your feedback!</p>
    </CardContent>
  </Card>
)}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            Community Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {ratings.map((rating: Rating, index: number) => (
                <div key={index}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={rating.avatar_url || rating.user_avatar || "/placeholder.svg"}
                        alt={rating.user_id}
                      />
                      <AvatarFallback>{rating.user_id?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {userNames[rating.user_id] || rating.user_id || "Anonymous"}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-xs"
                          onClick={() => setReplyOpenIndex(replyOpenIndex === index ? null : index)}
                          aria-label="Reply"
                        >
                          💬
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(rating.score, false, "sm")}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {rating.created_at && !isNaN(new Date(rating.created_at).getTime())
                            ? new Date(rating.created_at).toLocaleString("en-US", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Unknown date"}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-1">{rating.comment}</p>
                      {Array.isArray(rating.replies) && replyOpenIndex === index && rating.replies.length > 0 && (
                        <div className="mt-2 mb-2 pl-4 border-l-2 border-gray-200">
                          <div className="font-semibold text-sm text-gray-600 mb-1">Reply section</div>
                          <div className="space-y-1">
                            {rating.replies.map((reply, ridx) => (
                              <div key={ridx} className="text-sm text-gray-700">
                                <div className="flex flex-row gap-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage
                                      src={reply.avatar_url || "/placeholder.svg"}
                                      alt={reply.user_id || reply.role}
                                    />
                                    <AvatarFallback>
                                      {reply.user_id
                                        ? userNames[reply.user_id]?.charAt(0) || reply.user_id.charAt(0)
                                        : reply.role?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-end">
                                    {reply.user_id
                                      ? userNames[reply.user_id] || reply.user_id
                                      : reply.role}
                                    {reply.created_at && (
                                      <span className="ml-2 text-xs text-gray-400">
                                        {new Date(reply.created_at).toLocaleString("en-US", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <p className="p-1">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {replyOpenIndex === index && (
                        <form
                          className="flex items-center gap-2 mt-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (rating._id && replyValue.trim()) {
                              setCurrentCommentId(rating._id);
                              Ireply(
                                { role: "user", content: replyValue },
                                {
                                  onSuccess: () => {
                                    queryClient.invalidateQueries({ queryKey: ["housingArea", housingId] });
                                    setReplyValue("");
                                    setCurrentCommentId(undefined);
                                    toast.success("Add reply successful!");
                                  },
                                  onError: () => {
                                    toast.error("Reply failed!");
                                  },
                                }
                              );
                            }
                          }}
                        >
                          <Input
                            value={replyValue}
                            onChange={(e) => setReplyValue(e.target.value)}
                            placeholder="Nhập phản hồi..."
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <Button type="submit" size="sm" className="h-8 px-3 bg-red-700 hover:bg-red-600" disabled={!replyValue.trim()}>
                            Send
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                  {index < ratings.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {data && <PagingPage page={page} setPage={setPage} totalpage={data.totalPages} />}
    </div>
  );
};

export default HousingRatings;

     