"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import {
  useSearchUser,
  useUpdateUserStatus,
  useGetCount,
  useGetOneUser,
} from "@/queries/user.queries";
import { useDebounce } from "@/hooks/useDebounce";
import PagingPage from "@/components/pagingation/pagingPage";
import { useQueryClient } from "@tanstack/react-query";
// import ChevronDownIcon from "@/components/ui/dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import fetchWithAuth from "@/utils/api/fetchWithAuth";

const supabase = createClient();

// Define enums for role and sort options
enum RoleEnum {
  User = "User",
  Landlord = "Landlord",
  Admin = "admin",
}
enum SortEnum {
  date = "created_at",
  name = "name",
}

// Define user interface
export interface IUser {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleEnum;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar?: string;
}



// Component for Landlord Detail Modal
function LandlordDetailModal({ open, onClose, user, onApprove, onReject }: any) {
  if (!user) return null;
  // Lấy property_document từ user data (đã được join từ backend)
  const propertyDoc: any = user.property_document;
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  
  const handleReject = () => {
    if (showRejectForm && rejectReason.trim()) {
      onReject(user.auth_user_id, rejectReason);
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      setShowRejectForm(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-100 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-neutral-400" />
            Landlord Registration Information
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {user.phone}
          </div>
          <div>
            <span className="font-semibold">Registration Date:</span> {new Date(user.created_at).toLocaleString("en-US")}
          </div>
          <div>
            <span className="font-semibold">Document Type:</span> {propertyDoc?.type || "No information"}
          </div>
          <div>
            <span className="font-semibold">Description:</span> {propertyDoc?.description || "No description"}
          </div>
          <div>
            <span className="font-semibold">Document Images ({propertyDoc?.image?.length || 0} images):</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {propertyDoc?.image?.length > 0 ? propertyDoc.image.map((img: any, idx: number) => (
                <div key={idx} className="relative">
                  <img 
                    src={img.url} 
                    alt={`property-doc-${idx}`} 
                    className="w-full h-32 object-cover rounded border border-neutral-700 cursor-pointer hover:opacity-80" 
                    onClick={() => window.open(img.url, '_blank')}
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                    {img.type}
                  </div>
                </div>
              )) : (
                <p className="text-neutral-400 col-span-full">No document images</p>
              )}
            </div>
          </div>
          
          {showRejectForm && (
            <div className="space-y-2">
              <label className="font-semibold">Rejection Reason:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 flex gap-2">
          <Button 
            variant="default" 
            onClick={() => onApprove(user.auth_user_id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Approve
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
          >
            <XCircle className="w-4 h-4 mr-1" /> 
            {showRejectForm ? "Confirm Reject" : "Reject"}
          </Button>
          <Button variant="outline" onClick={onClose} className="text-black hover:text-black">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component for Pending Landlord Table Row
function PendingLandlordTableRow({ user, setSelectedUser, setModalOpen, onPendingCountChange }: any) {
  const { data: userDetail } = useGetOneUser(user.auth_user_id);
  
  // Chỉ hiển thị nếu user có property_document và chưa phải landlord
  const isPending = userDetail?.property_document && user.role !== 'landlord';
  
  // Notify parent component about pending status
  useEffect(() => {
    if (onPendingCountChange) {
      onPendingCountChange(user.auth_user_id, isPending);
    }
  }, [isPending, onPendingCountChange, user.auth_user_id]);
  
  if (!isPending) {
    return null;
  }

  // Function to get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TableRow key={user.auth_user_id} className="border-b border-neutral-700 hover:bg-neutral-700/50 transition-colors duration-200" data-pending="true">
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-neutral-600 shadow-lg">
            <AvatarImage
              src={
                userDetail?.avatar_url ||
                "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"
              }
              alt={user.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-neutral-200 font-bold text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-semibold text-neutral-100 text-sm">{user.name}</p>
            <p className="text-xs text-neutral-400">ID: {user.auth_user_id.slice(0, 8)}...</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 px-6 text-neutral-200 text-sm">{user.email}</TableCell>
      <TableCell className="py-4 px-6 text-neutral-200 text-sm">{user.phone || "N/A"}</TableCell>
      <TableCell className="py-4 px-6 text-neutral-200 text-sm">
        {new Date(user.created_at).toLocaleDateString("vi-VN")}
      </TableCell>
      <TableCell className="py-4 px-6">
        <span className="text-neutral-200 text-sm font-medium">
          {userDetail.property_document?.type || "Pending"}
        </span>
      </TableCell>
      <TableCell className="py-4 px-6 text-center">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => { 
            setSelectedUser({...user, property_document: userDetail.property_document}); 
            setModalOpen(true); 
          }}
                    className="bg-red-100 text-black border-red-300 hover:bg-red-700 hover:text-white transition-all duration-200 px-4 py-2 rounded-lg shadow-sm"
        >
          <Eye className="w-4 h-4 mr-2" /> 
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Component for Pending Landlords Tab
function PendingLandlordsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState("10");
  const [pendingCount, setPendingCount] = useState(0);
  
  const debouncedSearchQuery = useDebounce(search, 500);
  
  const { data: allUsersData, isLoading, refetch } = useSearchUser(
    debouncedSearchQuery,
    1, // Fixed page 1
    "100", // Tăng limit lên 100 để lấy nhiều data
    "", // Không filter role
    "created_at",
    "desc",
    "" // Không filter status
  );

  // Debug data
  console.log("=== DEBUG PENDING LANDLORDS TAB ===");
  console.log("allUsersData:", allUsersData);
  console.log("allUsersData?.data:", allUsersData?.data);
  console.log("isLoading:", isLoading);
  console.log("search:", search);
  console.log("debouncedSearchQuery:", debouncedSearchQuery);
  
  // Tất cả users để render trong PendingLandlordTableRow (filter sẽ được thực hiện trong component)
  const allUsers = allUsersData?.data || [];
  
  console.log("allUsers:", allUsers);
  
  // Track pending count
  const handlePendingCountChange = (userId: string, isPending: boolean) => {
    // Simple approach: count all visible pending users
    setTimeout(() => {
      const pendingRows = document.querySelectorAll('[data-pending="true"]');
      setPendingCount(pendingRows.length);
    }, 100);
  };

  // Auto count pending users when data changes
  useEffect(() => {
    if (!isLoading && allUsers.length > 0) {
      setTimeout(() => {
        const pendingRows = document.querySelectorAll('[data-pending="true"]');
        setPendingCount(pendingRows.length);
      }, 200);
    }
  }, [allUsers, isLoading]);

  const handleApprove = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: 'landlord' })
        .eq('auth_user_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-count"] });
      
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "users" 
      });
      
      // Force refetch after a short delay
      setTimeout(() => {
        refetch();
      }, 100);
      
      toast.success("Approve successful!");
      setModalOpen(false);
    } catch (e: any) {
      toast.error("Error while approve: " + e.message);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      console.log("Calling DELETE API for user:", userId, "with reason:", reason);
      
      const response = await fetchWithAuth(`/api/users/${userId}/property-document`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Cannot delete property_document: ${response.status}`);
      }
      
      console.log("Rejected user:", userId, "with reason:", reason);
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-count"] });
      
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "users" 
      });
      
      // Force refetch after a short delay
      setTimeout(() => {
        refetch();
      }, 100);
      
      toast.success("Required was rejected!");
      setModalOpen(false);
    } catch (e: any) {
      console.error("Reject error:", e);
      toast.error("Error while reject: " + e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 bg-neutral-800 border-neutral-600 text-neutral-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700 shadow-lg">
        </Card>
      </div> */}

      {/* Table */}
      <Card className="bg-neutral-800 border-neutral-700 shadow-xl rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neutral-700 bg-neutral-750">
                <TableHead className="text-neutral-300 font-semibold py-4 px-6">Information</TableHead>
                <TableHead className="text-neutral-300 font-semibold py-4 px-6">Email</TableHead>
                <TableHead className="text-neutral-300 font-semibold py-4 px-6">Phone</TableHead>
                <TableHead className="text-neutral-300 font-semibold py-4 px-6">Registration Date</TableHead>
                <TableHead className="text-neutral-300 font-semibold py-4 px-6">Document Type</TableHead>
                <TableHead className="text-neutral-300 font-semibold py-4 px-6 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-400 py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span>Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-400 py-12">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-12 w-12 text-neutral-600" />
                      <span className="text-lg font-medium">No pending requests</span>
                      <span className="text-sm text-neutral-500">No one has registered as landlord</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                allUsers.map((user: any) => (
                  <PendingLandlordTableRow 
                    key={user.auth_user_id}
                    user={user}
                    setSelectedUser={setSelectedUser}
                    setModalOpen={setModalOpen}
                    onPendingCountChange={handlePendingCountChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination - Tạm thời hiển thị trang 1 */}
      <div className="flex justify-center mt-8">
        <div className="bg-neutral-800 rounded-lg p-2 shadow-lg">
          <PagingPage
            page={1}
            setPage={() => {}} // Disable page change
            totalpage={1} // Always show page 1
          />
        </div>
      </div>

      {/* Modal */}
      <LandlordDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

function UserTableRow({
  user,
  sortBy,
  getColor,
  getInitials,
  mutate,
  queryClient,
  debouncedSearchQuery,
  page,
  limit,
  role,
  sortOrder,
  setRefetchTrigger,
  refetch,
}: {
  user: IUser;
  sortBy: string;
  getColor: (
    role: string
  ) => "default" | "secondary" | "outline" | "destructive" | null | undefined;
  getInitials: (name: string) => string;
  mutate: any;
  queryClient: any;
  debouncedSearchQuery: string;
  page: number;
  limit: string;
  role: string;
  sortOrder: "asc" | "desc";
  setRefetchTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  refetch: () => void;
}) {
  const { data: userDetail } = useGetOneUser(user.auth_user_id);
  // console.log(useGetOneUser(user.auth_user_id))
  return (
    <TableRow
      key={user.auth_user_id}
      className="hover:bg-neutral-700 transition-colors border-b border-neutral-700"
    >
      <TableCell className="py-4">
        <Link href={`/user/${user.auth_user_id}`}>
          <div className="flex items-center gap-3 ml-5">
            <Avatar className="h-10 w-10 ring-2 ring-neutral-700">
              <AvatarImage
                src={
                  userDetail?.avatar_url ||
                  "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Begrippenlijst.svg"
                }
                alt={user.name}
              />
              <AvatarFallback className="bg-neutral-700 text-neutral-200 font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-neutral-100">{user.name}</p>
              <p className="text-xs text-neutral-400">
                ID: {user.auth_user_id}
              </p>
              {sortBy === "created_at" ? (
                <p className="text-xs text-neutral-500">
                  Created at:{" "}
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              ) : null}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="py-4">
        <div>
          <p className="text-sm text-neutral-200">{user.email}</p>
          <p className="text-xs text-neutral-400">
            {user.phone || "No phone number"}
          </p>
        </div>
      </TableCell>
      <TableCell className="py-4 text-center">
        <Badge
          variant={getColor(user.role)}
          style={{ margin: "0 auto" }}
          className={
            user.role === "admin"
              ? "bg-red-700 hover:bg-red-700 text-white"
              : user.role === RoleEnum.Landlord
                ? "bg-blue-700 hover:bg-blue-700 text-white"
                : "bg-neutral-900 hover:bg-neutral-900 text-neutral-100"
          }
        >
          {user.role}
        </Badge>
      </TableCell>
      <TableCell className="py-4 text-center">
        <Badge
          variant={user.is_active ? "default" : "secondary"}
          className={
            user.is_active
              ? "bg-green-700 hover:bg-green-800 text-white"
              : "bg-red-700 text-white"
          }
        >
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="py-4 text-center mr-5">
        {user.role !== "admin" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent text-neutral-300 hover:text-neutral-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-neutral-800 border-neutral-700"
            >
              <DropdownMenuLabel className="text-neutral-300">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem
                onClick={() => {
                  mutate(
                    { userId: user.auth_user_id },
                    {
                      onSuccess: () => {
                        // Invalidate all user-related queries
                        queryClient.invalidateQueries({
                          queryKey: ["users"],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["user-count"],
                        });
                        // Force refetch current data
                        refetch();
                        setRefetchTrigger((prev) => !prev);
                      },
                    }
                  );
                }}
                className="text-neutral-300 hover:bg-neutral-700"
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  // State for search, pagination, filters, and sorting
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [role, setRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // State for total user count
  const [countRecord, setCountRecord] = useState<number>(0);
  const [activeCountRecord, setActiveCountRecord] = useState<number>(0);
  const [deactiveCountRecord, setDeactiveCountRecord] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const selectedStatus = status;
  // State to force refetch (fallback)
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  // Debounce search input to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(search, 500);

  // Mutation hook for updating user status
  const { mutate } = useUpdateUserStatus();

  // Query hook for fetching user list
  const { data, isLoading, refetch } = useSearchUser(
    debouncedSearchQuery,
    page,
    limit,
    role === "all" ? "" : role,
    sortBy,
    sortOrder,
    status
  );
  const listUsers = data?.data || [];
  // console.log(listUsers);

  // Function to determine badge color based on role
  function getColor(
    role: string
  ): "default" | "secondary" | "outline" | "destructive" | null | undefined {
    let color:
      | "default"
      | "secondary"
      | "outline"
      | "destructive"
      | null
      | undefined;
    if (role === "user") {
      color = "secondary";
    } else if (role === "admin") {
      color = "destructive";
    } else {
      color = "default";
    }
    return color;
  }

  // Function to get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) {
      return "";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Debug: Log query data to verify refetch
  // console.log("Users data:", data)

  // Reset page to 1 when search, role, sortBy, or sortOrder changes
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [search, role, sortBy, sortOrder, status]);

  // Fetch total user count when search or role changes
  useEffect(() => {
    async function getTotalRecord() {
      try {
        const totalCount = await useGetCount();
        setCountRecord(totalCount);
      } catch (error) {
        console.error("Failed to fetch total count:", error);
      }
    }
    async function getTotalActiveRecord() {
      try {
        const totalCount = await useGetCount("active");
        setActiveCountRecord(totalCount);
      } catch (error) {
        console.error("Failed to fetch total count:", error);
      }
    }
    async function getTotalDeactiveRecord() {
      try {
        const totalCount = await useGetCount("deactive");
        setDeactiveCountRecord(totalCount);
      } catch (error) {
        console.error("Failed to fetch total count:", error);
      }
    }
    getTotalDeactiveRecord();
    getTotalActiveRecord();
    getTotalRecord();
  }, [debouncedSearchQuery, role, mutate, refetchTrigger, refetch]);

  // Force refetch when refetchTrigger changes (fallback)
  useEffect(() => {
    refetch();
  }, [refetchTrigger, refetch]);

  return (
    <div className="min-h-screen bg-neutral-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-start items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">
              User Management
            </h1>
            <p className="text-neutral-400 mt-1">
              Manage and monitor user information in the system
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-800 border-neutral-700">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
            >
              <Users className="w-4 h-4 mr-2" />
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="pending-landlords"
              className="data-[state=active]:bg-neutral-700 data-[state=active]:text-neutral-100"
            >
              <FileText className="w-4 h-4 mr-2" />
              Pending Landlords
            </TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className={`border-0 shadow bg-neutral-800 cursor-pointer transition-all duration-200
                 ${selectedStatus === "" ? "ring-2 ring-blue-500 scale-105" : ""}`}
                onClick={() => setStatus("")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-neutral-100">
                        {countRecord ?? 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-neutral-700 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`border-0 shadow bg-neutral-800 cursor-pointer transition-all duration-200
                 ${selectedStatus === "active" ? "ring-2 ring-green-500 scale-105" : ""}`}
                onClick={() => setStatus("active")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">
                        Active Users
                      </p>
                      <p className="text-2xl font-bold text-neutral-100">
                        {activeCountRecord ?? 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-700 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card
                className={`border-0 shadow bg-neutral-800 cursor-pointer transition-all duration-200
                 ${selectedStatus === "deactive" ? "ring-2 ring-red-500 scale-105" : ""}`}
                onClick={() => setStatus("deactive")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">
                        Deactive Users
                      </p>
                      <p className="text-2xl font-bold text-neutral-100">
                        {deactiveCountRecord ?? 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-700 rounded-lg flex items-center justify-center">
                      <UserX className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-neutral-700 border-neutral-600 text-neutral-100 placeholder-neutral-400"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-40 bg-neutral-700 border-neutral-600 text-neutral-100">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-700 border-neutral-600">
                        <SelectItem value="all" className="text-neutral-100">
                          All Roles
                        </SelectItem>
                        <SelectItem value="user" className="text-neutral-100">
                          User
                        </SelectItem>
                        <SelectItem value="landlord" className="text-neutral-100">
                          Landlord
                        </SelectItem>
                        <SelectItem value="admin" className="text-neutral-100">
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 bg-neutral-700 border-neutral-600 text-neutral-100">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-700 border-neutral-600">
                        <SelectItem value="name" className="text-neutral-100">
                          Name
                        </SelectItem>
                        <SelectItem value="created_at" className="text-neutral-100">
                          Created At
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow bg-neutral-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-neutral-700 hover:bg-transparent">
                        <TableHead className="text-neutral-300 font-semibold">
                          User
                        </TableHead>
                        <TableHead className="text-neutral-300 font-semibold">
                          Contact
                        </TableHead>
                        <TableHead className="text-neutral-300 font-semibold text-center">
                          Role
                        </TableHead>
                        <TableHead className="text-neutral-300 font-semibold text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-neutral-300 font-semibold text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-neutral-400"
                          >
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : listUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-neutral-400"
                          >
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        listUsers.map((user: IUser) => (
                          <UserTableRow
                            key={user.auth_user_id}
                            user={user}
                            sortBy={sortBy}
                            getColor={getColor}
                            getInitials={getInitials}
                            mutate={mutate}
                            queryClient={queryClient}
                            debouncedSearchQuery={debouncedSearchQuery}
                            page={page}
                            limit={limit}
                            role={role}
                            sortOrder={sortOrder}
                            setRefetchTrigger={setRefetchTrigger}
                            refetch={refetch}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex justify-center">
              <PagingPage
                page={page}
                setPage={setPage}
                totalpage={data?.pagination?.totalPages || 1}
              />
            </div>
          </TabsContent>

          {/* Pending Landlords Tab */}
          <TabsContent value="pending-landlords">
            <PendingLandlordsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
