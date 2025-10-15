"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  XCircle,
  FileText,
  MoreHorizontal,
  // Trash2,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  adminSearchHousingArea,
  useAdminPublishHousingArea,
  useAdminUnpublishHousingArea,
  useAdminApproveUpdate,
  useAdminRejectHousingArea,
  useAdminDeleteHousingArea,
  useAdminRejectUpdate,
  useAdminApproveHousingArea,
} from "@/queries/housing-area.queries";
import PagingPage from "@/components/pagingation/pagingPage";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { CustomAlertDialog } from "@/components/alert-dialog_02";
import { Trash } from "lucide-react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// ===== INTERFACES =====
interface HousingArea {
  id?: string;
  owner_id: string;
  name: string;
  description: string;
  location: {
    address: string;
    district: string;
    city: string;
    lat: number;
    lng: number;
  };
  expected_rooms: number;
  legal_documents: {
    url: string;
    type: string;
    uploaded_at: { $date: string };
  }[];
  pending_update?: {
    name?: string;
    description?: string;
    expected_rooms?: number;
    location?: {
      address?: string;
      district?: string;
      city?: string;
      lat?: number;
      lng?: number;
    };
    legal_documents?: {
      url: string;
      type: string;
      uploaded_at?: { $date: string };
    }[];
  };
  user: {
    auth_user_id: string;
    avatar_url: string;
    email: string;
    id: string;
    name: string;
  };
  status: string;
  admin_unpublished: boolean;
  view_count: number;
  reject_reason: string;
  isPaid: boolean;
  rating: any[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

// ===== UTILITY FUNCTIONS =====
const statusConfig = {
  pending: {
    color: "bg-amber-700 text-white",
    icon: Clock,
    iconColor: "text-amber-400",
  },
  approved: {
    color: "bg-green-700 text-white",
    icon: CheckCircle,
    iconColor: "text-green-400",
  },
  published: {
    color: "bg-blue-700 text-white",
    icon: Eye,
    iconColor: "text-blue-400",
  },
  unpublished: {
    color: "bg-neutral-900 text-neutral-100",
    icon: EyeOff,
    iconColor: "text-neutral-400",
  },
  rejected: {
    color: "bg-red-700 text-white",
    icon: XCircle,
    iconColor: "text-red-400",
  },
  pending_update: {
    color: "bg-orange-700 text-white",
    icon: FileText,
    iconColor: "text-orange-400",
  },
};

// ===== VIEW MODAL =====
function ViewModal({
  open,
  onClose,
  housingArea,
}: {
  open: boolean;
  onClose: () => void;
  housingArea: HousingArea | null;
}) {
  if (!housingArea) return null;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj =
      typeof date === "object" && date.$date
        ? new Date(date.$date)
        : new Date(date);
    return (
      dateObj.toLocaleDateString("vi-VN") +
      " " +
      dateObj.toLocaleTimeString("vi-VN")
    );
  };

  const formatLocation = (location: any) => {
    if (!location) return "N/A";
    return `${location.address}, ${location.district}, ${location.city}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-100 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-neutral-400" />
            Housing Area Details - {housingArea.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Name
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.name}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Owner ID
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.owner_id}
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-neutral-400">
                  Description
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.description}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Expected Rooms
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.expected_rooms}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Status
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.status}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">Location</h3>
            <div className="space-y-2">
              <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                {formatLocation(housingArea.location)}
              </p>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Legal Documents ({housingArea.legal_documents?.length || 0})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {housingArea.legal_documents?.map((doc, index) => (
                <div key={index} className="space-y-2">
                  <Link target="_blank" href={doc.url}>
                    <img
                      src={doc.url || "/placeholder.svg"}
                      alt={`Document ${index + 1}`}
                      className="w-full h-32 object-cover rounded border border-neutral-700"
                    />
                  </Link>
                  <div className="text-xs text-neutral-400">
                    <p>Type: {doc.type}</p>
                    <p>Uploaded: {formatDate(doc.uploaded_at)}</p>
                  </div>
                </div>
              )) || <p className="text-neutral-400">No documents available</p>}
            </div>
          </div>

          {/* Rejection Reason */}
          {housingArea.reject_reason && housingArea.status == "rejected" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">
                Rejection Reason
              </h3>
              <div className="p-3 bg-red-700/20 border border-red-700 rounded">
                <p className="text-sm text-neutral-100">
                  {housingArea.reject_reason}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Created At
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {formatDate(housingArea.createdAt)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Updated At
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {formatDate(housingArea.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="text-neutral-100 border-neutral-700"
            onClick={onClose}
          >
            <p className="text-black">Close</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== COMPARISON MODAL =====
function ComparisonModal({
  open,
  onClose,
  housingArea,
  onApprove,
  onReject,
}: {
  open: boolean;
  onClose: () => void;
  housingArea: HousingArea | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!housingArea || !housingArea.pending_update) return null;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj =
      typeof date === "object" && date.$date
        ? new Date(date.$date)
        : new Date(date);
    return (
      dateObj.toLocaleDateString("vi-VN") +
      " " +
      dateObj.toLocaleTimeString("vi-VN")
    );
  };

  const formatLocation = (location: any) => {
    if (!location) return "N/A";
    return `${location.address}, ${location.district}, ${location.city}`;
  };

  const ComparisonField = ({
    label,
    oldValue,
    newValue,
  }: {
    label: string;
    oldValue: any;
    newValue: any;
  }) => {
    const hasChanged =
      newValue !== undefined &&
      JSON.stringify(oldValue) !== JSON.stringify(newValue);
    const formatValue = (value: any) => {
      if (value === undefined || value === null) return "N/A";
      if (typeof value === "object") {
        if (value.address) return formatLocation(value); // Location object
        return JSON.stringify(value);
      }
      return value;
    };

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-neutral-100">{label}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-3 rounded border border-neutral-700 ${hasChanged ? "bg-red-700/20" : "bg-neutral-800"}`}
          >
            <p className="text-xs text-neutral-400">Current</p>
            <p className="text-sm text-neutral-100">{formatValue(oldValue)}</p>
          </div>
          <div
            className={`p-3 rounded border border-neutral-700 ${hasChanged ? "bg-green-700/20" : "bg-neutral-800"}`}
          >
            <p className="text-xs text-neutral-400">Proposed</p>
            <p className="text-sm text-neutral-100">{formatValue(newValue)}</p>
          </div>
        </div>
      </div>
    );
  };

  const DocumentsComparison = ({
    oldDocs,
    newDocs,
  }: {
    oldDocs: any[];
    newDocs: any[];
  }) => {
    const hasChanged = JSON.stringify(oldDocs) !== JSON.stringify(newDocs);

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-neutral-100">
          Legal Documents
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-3 rounded border border-neutral-700 ${hasChanged ? "bg-red-700/20" : "bg-neutral-800"}`}
          >
            <p className="text-xs text-neutral-400 mb-2">
              Current ({oldDocs?.length || 0})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {oldDocs?.map((doc, index) => (
                <div key={index} className="space-y-1">
                  <Link target="_blank" href={doc.url}>
                    <img
                      src={doc.url || "/placeholder.svg"}
                      alt={`Current Doc ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-neutral-600"
                    />
                  </Link>

                  <div className="text-xs text-neutral-400">
                    <p>Type: {doc.type}</p>
                  </div>
                </div>
              )) || <p className="text-xs text-neutral-400">No documents</p>}
            </div>
          </div>
          <div
            className={`p-3 rounded border border-neutral-700 ${hasChanged ? "bg-green-700/20" : "bg-neutral-800"}`}
          >
            <p className="text-xs text-neutral-400 mb-2">
              Proposed ({newDocs?.length || 0})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {newDocs?.map((doc, index) => (
                <div key={index} className="space-y-1">
                  <img
                    src={doc.url || "/placeholder.svg"}
                    alt={`Proposed Doc ${index + 1}`}
                    className="w-full h-20 object-cover rounded border border-neutral-600"
                  />
                  <div className="text-xs text-neutral-400">
                    <p>Type: {doc.type}</p>
                  </div>
                </div>
              )) || <p className="text-xs text-neutral-400">No documents</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-neutral-900 text-neutral-100 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-neutral-400" />
            Compare Changes - {housingArea.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Basic Information
            </h3>
            <ComparisonField
              label="Name"
              oldValue={housingArea.name}
              newValue={housingArea.pending_update.name}
            />
            <ComparisonField
              label="Description"
              oldValue={housingArea.description}
              newValue={housingArea.pending_update.description}
            />
            <ComparisonField
              label="Expected Rooms"
              oldValue={housingArea.expected_rooms}
              newValue={housingArea.pending_update.expected_rooms}
            />
            <ComparisonField
              label="Location"
              oldValue={housingArea.location}
              newValue={housingArea.pending_update.location}
            />
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Legal Documents
            </h3>
            <DocumentsComparison
              oldDocs={housingArea.legal_documents}
              newDocs={
                housingArea.pending_update.legal_documents ||
                housingArea.legal_documents
              }
            />
          </div>

          {/* Additional Information (Current Only) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-100">
              Additional Information (Current)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Owner ID
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.owner_id}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Status
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {housingArea.status}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">
                  Created At
                </label>
                <p className="text-sm text-neutral-100 p-3 bg-neutral-800 rounded border border-neutral-700">
                  {formatDate(housingArea.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason if exists */}
          {housingArea.reject_reason && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">
                Current Rejection Reason
              </h3>
              <div className="p-3 bg-red-700/20 border border-red-700 rounded">
                <p className="text-sm text-neutral-100">
                  {housingArea.reject_reason}
                </p>
              </div>
            </div>
          )}
          {showRejectInput && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-100">
                Rejection Reason
              </label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-neutral-900 text-neutral-100 border-neutral-700 focus:ring-0"
              />
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="text-neutral-100 border-neutral-700"
            onClick={onClose}
          >
            <p className="text-black">Cancel</p>
          </Button>
          {!showRejectInput ? (
            <>
              <Button
                variant="destructive"
                className="bg-red-700 text-white hover:bg-red-800"
                onClick={() => setShowRejectInput(true)}
              >
                Reject
              </Button>
              <Button
                className="bg-green-700 text-white hover:bg-green-800"
                onClick={() => {
                  onApprove(housingArea.id || housingArea.owner_id);
                  onClose();
                }}
              >
                Approve
              </Button>
            </>
          ) : (
            <Button
              variant="destructive"
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={() => {
                if (rejectReason.trim()) {
                  onReject(
                    housingArea.id || housingArea.owner_id,
                    rejectReason
                  );
                  setRejectReason("");
                  setShowRejectInput(false);
                  onClose();
                }
              }}
            >
              Confirm Rejection
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== TABLE ROW =====
function HousingAreaRow({
  housingArea,
  onAction,
  onCompare,
  onView,
}: {
  housingArea: HousingArea;
  onAction: (action: string, id: string, reason?: string) => void;
  onCompare?: (housingArea: HousingArea) => void;
  onView?: (housingArea: HousingArea) => void;
}) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const effectiveStatus = housingArea.admin_unpublished
    ? "unpublished"
    : housingArea.status;
  const hasPendingUpdate =
    housingArea.pending_update &&
    Object.keys(housingArea.pending_update).length > 0;
  const config =
    statusConfig[
      hasPendingUpdate
        ? "pending_update"
        : (effectiveStatus as keyof typeof statusConfig)
    ];

  const handleReject = () => {
    if (rejectReason.trim()) {
      onAction("reject", housingArea.id || housingArea.owner_id, rejectReason);
      setRejectReason("");
      setShowRejectDialog(false);
    }
  };

  return (
    <>
      <TableRow
        className="hover:bg-neutral-700 transition-colors border-b border-neutral-700 "
        onClick={(e) => {
          if (
            (e.target as HTMLElement).closest("[role='menuitem']") ||
            (e.target as HTMLElement).closest(".text-red-400")
          ) {
            return;
          }
          if (hasPendingUpdate) {
            onCompare?.(housingArea);
          }
        }}
      >
        <TableCell className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={housingArea.legal_documents[0]?.url || "/placeholder.svg"}
                alt={housingArea.name}
                className="w-24 h-24 object-cover rounded-lg border border-neutral-600 shadow-sm"
              />
              {hasPendingUpdate && (
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full p-1.5 shadow-lg">
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-100 truncate mb-2">
                {housingArea.name}
              </h3>

              <p className="text-sm text-neutral-400 line-clamp-2 mb-2">
                {housingArea.description}
              </p>

              {/* Owner info with avatar */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={housingArea.user?.avatar_url}
                    alt={housingArea.user?.name}
                  />
                  <AvatarFallback className="bg-neutral-700 text-neutral-200 text-xs">
                    {housingArea.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-neutral-400">
                  {" "}
                  <b>{housingArea.user?.name || "None"}</b>
                </p>
              </div>

              <div className="flex gap-4 text-xs text-neutral-400">
                <span>Rooms: {housingArea.expected_rooms}</span>
                <span>•</span>
                <span>
                  Documents: {housingArea.legal_documents?.length || 0}
                </span>
              </div>
              {housingArea.reject_reason &&
                housingArea.status == "rejected" && (
                  <div className="mt-3 p-3 bg-red-700/20 border border-red-600 rounded-lg">
                    <p className="text-xs text-red-200 font-medium">
                      Rejection Reason:
                    </p>
                    <p className="text-xs text-neutral-100 mt-1">
                      {housingArea.reject_reason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center px-6 py-4">
          <Badge
            className={`${config.color} border-none font-medium hover:${config.color} px-3 py-1 rounded-full`}
          >
            {hasPendingUpdate
              ? "PENDING UPDATE"
              : effectiveStatus.toUpperCase()}
          </Badge>
        </TableCell>
        <TableCell className="text-center px-6 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent text-neutral-300"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-neutral-900 border-neutral-700 text-neutral-200"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(housingArea);
                }}
                className="hover:bg-neutral-800"
              >
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              {hasPendingUpdate && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare?.(housingArea);
                    }}
                    className="hover:bg-neutral-800"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Compare Changes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(
                        "approve",
                        housingArea.id || housingArea.owner_id
                      );
                    }}
                    className="hover:bg-neutral-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />{" "}
                    Approve Update
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRejectDialog(true);
                    }}
                    className="hover:bg-neutral-800"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-400" /> Reject
                  </DropdownMenuItem>
                </>
              )}
              {effectiveStatus === "pending" && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(
                        "approve",
                        housingArea.id || housingArea.owner_id
                      );
                    }}
                    className="hover:bg-neutral-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />{" "}
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRejectDialog(true);
                    }}
                    className="hover:bg-neutral-800"
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-400" /> Reject
                  </DropdownMenuItem>
                </>
              )}
              {effectiveStatus === "approved" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("publish", housingArea.id || housingArea.owner_id);
                  }}
                  className="hover:bg-neutral-800"
                >
                  <Eye className="h-4 w-4 mr-2 text-blue-400" /> Publish
                </DropdownMenuItem>
              )}
              {effectiveStatus === "published" && !hasPendingUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(
                      "unpublish",
                      housingArea.id || housingArea.owner_id
                    );
                  }}
                  className="hover:bg-neutral-800"
                >
                  <EyeOff className="h-4 w-4 mr-2 text-neutral-400" /> Unpublish
                </DropdownMenuItem>
              )}
              {effectiveStatus === "unpublished" && !hasPendingUpdate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("publish", housingArea.id || housingArea.owner_id);
                  }}
                  className="hover:bg-neutral-800"
                >
                  <Eye className="h-4 w-4 mr-2 text-blue-400" /> Publish
                </DropdownMenuItem>
              )}
              {/* No approve action for rejected, so skip rendering empty DropdownMenuItem */}
              {(() => {
                const triggerProps = {
                  variant: "ghost" as const,
                  className:
                    "w-full justify-start h-8 px-2 text-red-400 hover:bg-neutral-800 hover:text-red-400 font-normal border-transparent focus:ring-0 focus-visible:ring-0 focus:border-transparent active:border-transparent",
                  onClick: (e: React.MouseEvent) => e.stopPropagation(),
                };
                return (
                  <CustomAlertDialog
                    noRedBorder={true}
                    triggerText={
                      <div className="flex items-center min-w-32 h-2 gap-2">
                        <Trash width={15} height={15} />{" "}
                        <p className="text-sm font-medium">Delete</p>
                      </div>
                    }
                    title="Delete Housing Area"
                    description={`Are you sure you want to delete "${housingArea.name}"? This action cannot be undone.`}
                    onContinue={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onAction(
                        "delete",
                        housingArea.id || housingArea.owner_id
                      );
                    }}
                    cancelText="Cancel"
                    continueText="Delete"
                    triggerProps={triggerProps}
                  />
                );
              })()}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-neutral-900 text-neutral-100 border-neutral-700">
          <DialogHeader>
            <DialogTitle>Reject Housing Area</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="bg-neutral-900 text-neutral-100 border-neutral-700 focus:ring-0"
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="text-neutral-100 border-neutral-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              <p className="text-black">Cancel</p>
            </Button>
            <Button
              variant="destructive"
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={handleReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== MAIN COMPONENT =====
export default function HousingAreaManagement() {
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedHousingArea, setSelectedHousingArea] =
    useState<HousingArea | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showRejectUpdateDialog, setShowRejectUpdateDialog] = useState(false);
  const [rejectUpdateReason, setRejectUpdateReason] = useState("");
  const rejectUpdateMutation = useAdminRejectUpdate();

  const queryClient = useQueryClient();
  const { data: housingData, isLoading } = adminSearchHousingArea(
    status != "pending_update" ? status : null,
    search,
    status === "pending_update",
    page,
    10
  );
  const { data: statsData, refetch: refetchStats } = adminSearchHousingArea();
  const { data: pendingUpdatesData } = adminSearchHousingArea(null, "", true);
  
  // Create separate calls for pending and approved to debug
  const { data: pendingData } = adminSearchHousingArea("pending", "", false, 1, 1000);
  const { data: approvedData } = adminSearchHousingArea("approved", "", false, 1, 1000);

  const publishMutation = useAdminPublishHousingArea();
  const unpublishMutation = useAdminUnpublishHousingArea();
  const approveMutation = useAdminApproveHousingArea();
  const rejectMutation = useAdminRejectHousingArea();
  const deleteMutation = useAdminDeleteHousingArea();
  const approveUpdateMutation = useAdminApproveUpdate();

  function getCount(
    data: HousingArea[],
    status: string,
    pendingUpdates?: HousingArea[]
  ) {
    if (status === "pending_update") {
      if (!Array.isArray(pendingUpdates)) return 0;
      return pendingUpdates.filter(
        (d: HousingArea) =>
          d.pending_update && Object.keys(d.pending_update).length > 0
      ).length;
    }
    if (!Array.isArray(data)) return 0;
    const dataAfterFilter = data?.filter((d: any) => d.status === status);
    return dataAfterFilter?.length;
  }

  const stats = [
    {
      key: "pending",
      label: "Pending",
      count: pendingData?.data?.results?.length || 0,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-700",
    },
    {
      key: "approved",
      label: "Approved",
      count: approvedData?.data?.results?.length || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-700",
    },
    {
      key: "published",
      label: "Published",
      count: getCount(statsData?.data?.results, "published"),
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-700",
    },
    {
      key: "unpublished",
      label: "Unpublished",
      count: getCount(statsData?.data?.results, "unpublished"),
      icon: EyeOff,
      color: "text-neutral-400",
      bg: "bg-neutral-900",
    },
    {
      key: "rejected",
      label: "Rejected",
      count: getCount(statsData?.data?.results, "rejected"),
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-700",
    },
    {
      key: "pending_update",
      label: "Pending Updates",
      count: getCount(
        statsData?.data?.results,
        "pending_update",
        pendingUpdatesData?.data?.results
      ),
      icon: FileText,
      color: "text-orange-400",
      bg: "bg-orange-700",
    },
  ];

  const handleAction = async (action: string, id: string, reason?: string) => {
    try {
      const housingArea = housingData?.data?.results?.find(
        (ha: HousingArea) => (ha.id || ha.owner_id) === id
      );
      const hasPendingUpdate =
        housingArea?.pending_update &&
        Object.keys(housingArea.pending_update).length > 0;

      if (hasPendingUpdate && status === "pending_update") {
        if (action === "approve") {
          await approveUpdateMutation.mutateAsync(id);
        } else if (action === "reject") {
          await rejectUpdateMutation.mutateAsync({
            housingAreaId: id,
            reason: reason || "",
          });
        }
      } else {
        if (action === "approve") {
          await approveMutation.mutateAsync(id);
        } else if (action === "reject") {
          await rejectMutation.mutateAsync({
            housingAreaId: id,
            reason: reason || "",
          });
        } else if (action === "publish") {
          await publishMutation.mutateAsync(id);
        } else if (action === "unpublish") {
          await unpublishMutation.mutateAsync(id);
        } else if (action === "delete") {
          await deleteMutation.mutateAsync(id);
        }
      }

      toast.success(`${action} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["admin-housing-areas"] });
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action}.`);
    }
  };

  const handleCompare = (housingArea: HousingArea) => {
    setSelectedHousingArea(housingArea);
    setShowComparison(true);
  };

  const handleView = (housingArea: HousingArea) => {
    setSelectedHousingArea(housingArea);
    setShowView(true);
  };

  return (
    <div className="p-8 bg-neutral-900 min-h-screen">
      <Card className="mb-8 bg-neutral-800 border-neutral-700 shadow-xl rounded-xl">
        <CardHeader className="pb-6">
          <h1 className="text-3xl font-bold text-neutral-100">
            Housing Area Management
          </h1>
          <p className="text-neutral-400 text-lg">
            Manage and approve housing areas in the system
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className={`p-5 rounded-lg cursor-pointer bg-neutral-800 border border-neutral-700 hover:bg-neutral-750 transition-all duration-200 ${status === stat.key ? "ring-2 ring-blue-500 scale-105 shadow-lg" : ""}`}
                  onClick={() => {
                    setStatus(stat.key);
                    refetchStats();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg} shadow-sm`}
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold text-neutral-100">
                        {stat.count}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <Input
              placeholder="Search housing areas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-neutral-900 text-neutral-100 pl-12 pr-4 py-3 border border-neutral-700 focus:ring-2 focus:ring-blue-500 rounded-lg shadow-sm"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-700 shadow-lg">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-neutral-800 border-b border-neutral-700">
                  <TableHead className="font-semibold text-neutral-300 px-6 py-4">
                    Housing Area
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300 px-6 py-4">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-center text-neutral-300 w-20 px-6 py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-16 text-neutral-400"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : housingData?.data?.results?.length ? (
                  housingData.data.results.map((housingArea: HousingArea) => (
                    <HousingAreaRow
                      key={housingArea.id || housingArea.owner_id}
                      housingArea={housingArea}
                      onAction={handleAction}
                      onCompare={handleCompare}
                      onView={handleView}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-16 text-neutral-400"
                    >
                      No housing areas found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {housingData?.data?.totalPages > 0 && (
            <div className="flex justify-center mt-8">
              <div className="bg-neutral-800 rounded-lg p-2 shadow-md">
                <PagingPage
                  page={page}
                  setPage={setPage}
                  totalpage={housingData.data.totalPages}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ViewModal
        open={showView}
        onClose={() => setShowView(false)}
        housingArea={selectedHousingArea}
      />

      <ComparisonModal
        open={showComparison}
        onClose={() => setShowComparison(false)}
        housingArea={selectedHousingArea}
        onApprove={(id) => handleAction("approve", id)}
        onReject={(id, reason) => handleAction("reject", id, reason)}
      />
    </div>
  );
}
