"use client";

import bg2 from "@/assets/bg-2.png";
import verified from "@/assets/verified.png";
import UserInfoAccordion from "@/components/auth/user-info-accordion";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { useGetOneUser, useUpdateUser } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/utils/supabase/client";
import { deleteImage, uploadSingleImage } from "@/utils/supabase/upload-file";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import {
  ArrowLeftRight,
  CalendarDays,
  Camera,
  MessageCircleMore,
  MessageSquareText,
  Share,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paramUserId = params?.id as string;
  const myUserId = useUserStore((state) => state.userId);
  const [user, setUser] = useState<any>(null);
  const { data: userDetail } = useGetOneUser(paramUserId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUser();
  const [isViewDocument, setIsViewDocument] = useState(false);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar file change and upload to Supabase
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string,
    userDetail: { avatar_url?: string },
    setAvatarPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    // Preview the selected image
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    // Generate new avatar path
    const fileExt = file.name.split(".").pop();
    const filePath = `user/${userId}/avatar.${fileExt}`;

    // Upload the new avatar to Supabase
    const result = await uploadSingleImage(
      file,
      process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!,
      filePath
    );

    if (result.error) {
      toast.error("Upload failed: " + result.error);
      return;
    }

    // Extract old avatar path from public URL if it exists
    const oldAvatarPath = userDetail.avatar_url
      ? userDetail.avatar_url.replace(
          /^.*\/storage\/v1\/object\/public\/[^/]+\//,
          ""
        )
      : undefined;

    // Delete the old avatar if it exists and is different from the new one
    if (oldAvatarPath && oldAvatarPath !== filePath) {
      const deleted = await deleteImage(oldAvatarPath);
      if (!deleted) {
        toast.error("Failed to delete old avatar.");
      }
    }

    // Update user detail with new avatar URL
    userDetail = {
      avatar_url: result.url,
    };
    await updateUserMutation.mutateAsync(
      {
        userDetail,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["user", userId] });
        },
        onError: (error) => {
          toast.error("Failed to update user detail: " + error.message);
        },
      }
    );

    toast.success("Avatar uploaded successfully!");
  };

  // Calculate joined time
  let joinedText = "No information";
  if (user?.created_at) {
    const createdDate = new Date(user.created_at);
    const days = differenceInDays(new Date(), createdDate);
    joinedText = days > 0 ? `${days} days ago` : "Today";
  }

  useEffect(() => {
    if (!paramUserId) return;
    async function fetchUser() {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", paramUserId)
        .single();
      if (!error) setUser(user);
    }
    fetchUser();
  }, [paramUserId]);

  //console.log(JSON.stringify(user));
  // console.log("UserDetail:", userDetail);
  const isOwner = paramUserId === myUserId;

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "User Information" },
  ];

  //console.log("UserDetailPage - User:", userDetail);

  return (
    <div className="bg-primary-foreground min-h-[600px]">
      <div className="max-w-5xl mx-auto pt-6 pl-4">
        <SimpleBreadcrumb items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-[1fr_2fr] gap-4 p-4 mx-auto max-w-5xl justify-center">
        <Card className="h-auto self-start">
          <CardHeader className="relative flex flex-col items-center p-0 pb-4">
            <div className="w-full h-32 rounded-t-lg overflow-hidden">
              <img
                src={bg2.src}
                alt="Background"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="absolute top-16 left-4 w-24 h-24">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={
                    avatarPreview ||
                    userDetail?.avatar_url ||
                    "https://github.com/shadcn.png"
                  }
                  className="rounded-full object-cover"
                />
                <AvatarFallback>{user?.full_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span
                onClick={handleCameraClick}
                className="absolute bottom-1 -right-1 bg-primary-foreground rounded-full p-1 shadow"
              >
                <Camera className="w-5 h-5 text-foreground hover:cursor-pointer" />
              </span>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(e, paramUserId, userDetail, setAvatarPreview)
                }
              />
            </div>
            {userDetail?.verified && (
              <Image
                src={verified}
                alt="Verified"
                className="absolute -top-32 -right-32 w-30 h-30"
              />
            )}
          </CardHeader>
          <CardContent className="mt-10 text-xs space-y-2">
            <p className="text-lg font-semibold">{user?.name || "No name"}</p>
            <span className="flex items-center gap-2">
              <MessageCircleMore />
              <p>No rating</p>
            </span>
            {isOwner && (
              <>
                <Button
                  className="w-full my-1 bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Profile URL copied!");
                  }}
                >
                  <Share className="size-4 mr-2" /> Share your profile
                </Button>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={"outline"}
                    className="w-full my-1 p-1"
                    onClick={() => router.push("/user/property-document")}
                  >
                    <TableProperties className="size-4 mr-2" />
                    Property documents
                  </Button>
                  <Button
                    variant={"outline"}
                    className="w-full my-1 p-1"
                    onClick={() => router.push("/user/history-transaction")}
                  >
                    <ArrowLeftRight className="size-4 mr-2" />
                    Transaction history
                  </Button>
                </div>
              </>
            )}
            <p className="flex items-center gap-2">
              <MessageSquareText />
              Feedback chat:{" "}
              <span className="font-semibold">No information</span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays />
              Joined: <span className="font-semibold">{joinedText}</span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck />
              Verified:{" "}
              <span className="font-semibold">
                {userDetail?.verified ? "Yes" : "No"}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO */}
            <UserInfoAccordion
              name={user?.name || ""}
              phone={user?.phone || ""}
              verified={userDetail?.verified || false}
              bankAccount={userDetail?.bank_account || ""}
              cardId={userDetail?.identity_card || ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
