"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDownIcon, Eye } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGetDisputeById,
  useGetListDisputes,
  useAdminHandleDisputeDecision,
} from "@/queries/dispute.queries";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisputeResolution } from "@/lib/type";
import { toast } from "sonner";

export default function HousingAreaManagement() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [adminReason, setAdminReason] = useState<string>("");
  const limit = 10;
  const { data, isLoading, error } = useGetListDisputes(page, limit, status);
  const [idDispute, setIdDispute] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { data: detailDispute } = useGetDisputeById(idDispute);
  const { data: detailRoom } = useGetRoomDetailByRoomId(
    detailDispute?.contract_id?.room_id
  );
  const disputerWinMutation = useAdminHandleDisputeDecision();
  const rejectDisputeMutation = useAdminHandleDisputeDecision();

  console.log(data);
  const totalPages = data?.totalPages ?? 1;
  console.log(totalPages);

  const handleDisputerWin = async () => {
    if (!adminReason.trim() || !idDispute) return;

    try {
      await disputerWinMutation.mutateAsync({
        disputeId: idDispute,
        reason: adminReason,
        decision: DisputeResolution.DISPUTERWINS,
      });

      // Reset form and close dialog
      setAdminReason("");
      setIdDispute("");
      setIsDialogOpen(false);

      // Success notification
      toast.success("Dispute resolved in favor of disputer!");
    } catch (error) {
      // Error notification
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to resolve dispute in favor of disputer."
      );
    }
  };

  const handleRejectDispute = async () => {
    if (!adminReason.trim() || !idDispute) return;

    try {
      await rejectDisputeMutation.mutateAsync({
        disputeId: idDispute,
        reason: adminReason,
        decision: DisputeResolution.REJECTED,
      });

      // Reset form and close dialog
      setAdminReason("");
      setIdDispute("");
      setIsDialogOpen(false);

      // Success notification
      toast.success("Dispute rejected!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject dispute."
      );
    }
  };

  if (isLoading) return <h2>Loading..</h2>;

  if (error) return <h2>Error..</h2>;

  return (
    <div className="p-6 bg-neutral-900">
      <Card className="mb-6 bg-neutral-800 border-neutral-700">
        <CardHeader>
          <h1 className="text-2xl font-bold text-neutral-100">
            Disputes Management
          </h1>
          <p className="text-neutral-400">
            View and manage user disputes in the system
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md mb-6">
            <Select onValueChange={(value) => setStatus(value)}>
              <SelectTrigger
                id="status-select"
                className="w-full max-w-[200px] h-11 bg-neutral-900 border border-neutral-700 text-neutral-100 rounded focus:border-none focus:ring-0 focus:outline-none"
              >
                <SelectValue placeholder="Choose status" />
                <ChevronDownIcon />
              </SelectTrigger>
              <SelectContent className="border-2  border-gray-600 shadow-lg bg-neutral-900 ">
                <SelectGroup>
                  <SelectItem
                    value="resolved"
                    className="cursor-pointer hover:bg-green-900/20 focus:bg-green-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 font-medium">
                        Resolved
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="rejected"
                    className="cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-400 font-medium">Rejected</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="pending"
                    className="cursor-pointer hover:bg-yellow-900/20 focus:bg-yellow-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-400 font-medium">
                        Pending
                      </span>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded">
            <Table className="min-w-full mb-4">
              {/* Header table*/}
              <TableHeader>
                <TableRow className="bg-neutral-800 border-b border-neutral-700">
                  <TableHead className="font-semibold text-neutral-300 w-20">
                    Avatar
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300 ">
                    Reason
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300 ">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300 ">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* Body table*/}
              <TableBody>
                {data?.disputes?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      font-semibold
                      leading-none
                      tracking-tight
                      colSpan={5}
                      className="text-center text-neutral-400"
                    >
                      <p className="my-2">No data</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {data?.disputes?.map((dispute: any) => {
                      return (
                        <TableRow className="hover:bg-muted/50 border-b-white/35 h-[56px]">
                          <TableCell className="w-20">
                            <Avatar className="h-10 w-10 ring-2 ring-neutral-700 mx-auto">
                              <AvatarImage
                                src={
                                  dispute?.disputer_info?.avatar ||
                                  "https://anhnail.com/wp-content/uploads/2024/11/Hinh-gai-xinh-2k4.jpg"
                                }
                              />
                            </Avatar>
                          </TableCell>
                          <TableCell className="text-center text-white font-lg">
                            {dispute?.disputer_info?.full_name}
                          </TableCell>
                          <TableCell className="text-center w-[330px] py-2">
                            <div className="text-sm text-white line-clamp-3 text-left">
                              {dispute?.reason}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {dispute?.status === "pending" ? (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-500 text-black text-xs font-semibold hover:bg-yellow-500 hover:text-black cursor-default"
                              >
                                Pending
                              </Badge>
                            ) : dispute?.status === "rejected" ? (
                              <Badge
                                variant="secondary"
                                className="bg-red-500 text-black hover:bg-red-500 hover:text-black cursor-default"
                              >
                                Rejected
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-green-500 text-black text-xs font-semibold hover:text-black hover:bg-green-500 cursor-default"
                              >
                                Resolved
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            <Dialog
                              open={isDialogOpen}
                              onOpenChange={setIsDialogOpen}
                            >
                              <form>
                                <DialogTrigger asChild>
                                  <Eye
                                    className="h-5 w-5 text-white mx-auto cursor-pointer hover:opacity-70"
                                    onClick={() => {
                                      setIdDispute(dispute._id);
                                      setAdminReason(""); // Reset reason when opening dialog
                                      setIsDialogOpen(true);
                                    }}
                                  />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] text-white bg-neutral-900 border-neutral-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-semibold">
                                      Disputes of{" "}
                                      {detailDispute?.disputer_info
                                        ? detailDispute?.disputer_info
                                            ?.full_name
                                        : "loading..."}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4">
                                    <div className="flex flex-row gap-2 items-center">
                                      <Label htmlFor="username-1">
                                        Room name:
                                      </Label>
                                      <p className="text-sm text-gray-300">{`${detailRoom?.room_number} - ${detailRoom?.title}`}</p>
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="name-1">
                                        Dispute Reason
                                      </Label>
                                      {detailDispute?.reason ? (
                                        <div className="p-3 bg-neutral-800 rounded-md border border-neutral-700">
                                          <p className="text-sm text-gray-300">
                                            {detailDispute.reason}
                                          </p>
                                        </div>
                                      ) : (
                                        <p>loading...</p>
                                      )}
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="name-1">Evidence</Label>
                                      {detailDispute?.evidence ? (
                                        <EvidenceGallery
                                          images={
                                            detailDispute?.evidence?.map(
                                              (img: any) => img.url
                                            ) || []
                                          }
                                        />
                                      ) : (
                                        <p>loading...</p>
                                      )}
                                    </div>
                                    <div className="grid gap-3">
                                      <Label htmlFor="admin-reason">
                                        Admin Decision Reason
                                      </Label>
                                      <Textarea
                                        id="admin-reason"
                                        placeholder="Enter your reason for this decision..."
                                        value={adminReason}
                                        onChange={(e) =>
                                          setAdminReason(e.target.value)
                                        }
                                        className="min-h-[100px] bg-neutral-800 border-neutral-600 text-white placeholder:text-neutral-400 focus:border-neutral-500"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button
                                        variant="outline"
                                        className="bg-black text-white border-none hover:bg-neutral-800 hover:text-white"
                                        onClick={() => setAdminReason("")}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <Button
                                      className="bg-blue-500 text-white border-none hover:bg-blue-600 hover:text-white"
                                      disabled={
                                        !adminReason.trim() ||
                                        disputerWinMutation.isPending
                                      }
                                      onClick={handleDisputerWin}
                                    >
                                      {disputerWinMutation.isPending
                                        ? "Processing..."
                                        : "Disputer win"}
                                    </Button>
                                    <Button
                                      className="bg-red-500 text-white border-none hover:bg-red-600 hover:text-white"
                                      disabled={
                                        !adminReason.trim() ||
                                        rejectDisputeMutation.isPending
                                      }
                                      onClick={handleRejectDispute}
                                    >
                                      {rejectDisputeMutation.isPending
                                        ? "Processing..."
                                        : "Reject"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </form>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </TableBody>
            </Table>

            {/* Pagination*/}
            <Pagination>
              <PaginationContent className="text-neutral-400 ">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                      }}
                      className={`px-3 py-1 rounded-md border text-sm text-white ${
                        page === i + 1 ? "bg-red-500 hover:bg-red-500" : ""
                      }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
