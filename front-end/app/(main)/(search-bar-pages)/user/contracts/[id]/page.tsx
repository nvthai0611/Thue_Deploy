"use client";

import ContractBook from "@/components/contract-book";
import { createClient } from "@/lib/client";
import {
  ContractStatus,
  CreateOrderPayload,
  SupabaseUser,
  TransactionType,
} from "@/lib/type";
import {
  useConfirmExtension,
  useGetContractById,
  useRequestExtension,
  useSignByLandlord,
} from "@/queries/contract.queries";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import { useGetOneUser } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  addMilliseconds,
  differenceInDays,
  differenceInYears,
  parseISO,
} from "date-fns";
import {
  ChevronDownIcon,
  Loader2,
  AlertTriangle,
  Upload,
  X,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  CircleDollarSign,
  Calendar as CalendarIcon,
  Save,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import deposit from "@/assets/deposit.png";
import Image from "next/image";
import { useCreateOrder } from "@/queries/zalo-pay.queries";
import { random5DigitNumber } from "@/utils/utils";
import expired from "@/assets/expired.png";
import nonExpired from "@/assets/non-expired.png";
import dispute from "@/assets/dispute.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  useCreateDispute,
  useGetDisputeByContractId,
} from "@/queries/dispute.queries";
import { uploadDisputeEvidenceFiles } from "@/utils/supabase/upload-file";
import { Badge } from "@/components/ui/badge";

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"];

export default function ContractDetailPage() {
  const { id: contractId } = useParams();
  const supabase = createClient();

  // Contract data fetching
  const { data: contractData, isLoading: isLoadingContract } =
    useGetContractById(contractId as string);
  console.log("Contract Data:", contractData);
  const { data: disputeData } = useGetDisputeByContractId(contractId as string);
  console.log("Dispute Data:", disputeData);

  // Contract status checks
  const isContractPending = contractData?.status === ContractStatus.pending;
  const isContractActive = contractData?.status === ContractStatus.active;

  // Contract date calculations
  const rentalFrom = contractData?.start_date;
  const rentalTo = contractData?.end_date;
  const rentalYears =
    contractData?.start_date && contractData?.end_date
      ? differenceInYears(
          addMilliseconds(parseISO(contractData.end_date), 1000),
          parseISO(contractData.start_date)
        )
      : 0;
  const daysToEnd = contractData?.end_date
    ? differenceInDays(parseISO(contractData.end_date), new Date())
    : null;

  // Signature status
  const tenantChecked = contractData?.signature?.tenant_signature || false;
  const landlordChecked = contractData?.signature?.owner_signature || false;

  // User information
  const roomId = contractData?.room_id;
  const tenantId = contractData?.tenant_id;
  const landlordId = contractData?.owner_id;
  const [tenantInfo, setTenantInfo] = useState<SupabaseUser | null>(null);
  const [landlordInfo, setLandlordInfo] = useState<SupabaseUser | null>(null);
  const currentuserId = useUserStore((state) => state.userId);
  const isLandlord = currentuserId === landlordId;

  // Extension date picker state
  const [extensionDate, setExtensionDate] = React.useState<Date | undefined>(
    undefined
  );
  const [openDatePicker, setOpenDatePicker] = React.useState(false);

  // Dispute form states
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeFiles, setDisputeFiles] = useState<File[]>([]);
  const [disputeFileUrls, setDisputeFileUrls] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Data fetching hooks
  const { data: tenantDetail } = useGetOneUser(tenantId);
  const { data: landlordDetail } = useGetOneUser(landlordId);
  const { data: roomDetail } = useGetRoomDetailByRoomId(roomId);

  // Mutation hooks
  const signByLandlord = useSignByLandlord(contractId as string);
  const requestExtension = useRequestExtension(contractId as string);
  const confirmExtension = useConfirmExtension(contractId as string);
  const createOrder = useCreateOrder();
  const createDispute = useCreateDispute();
  const queryClient = useQueryClient();

  // File validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File "${file.name}" is too large. Max 5MB.`,
      };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File "${file.name}" has invalid format. Only JPEG, PNG, PDF, DOC, DOCX allowed.`,
      };
    }
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File "${file.name}" has invalid extension.`,
      };
    }
    return { isValid: true };
  };

  // Handle deposit payment order creation
  const handleCreateOrder = async () => {
    try {
      const app_trans_id = random5DigitNumber();
      const app_user = currentuserId!;
      const amount = roomDetail.price;
      const embed_data = JSON.stringify({
        contract_id: contractId,
        user_id: currentuserId,
        type: TransactionType.DEPOSIT,
      });
      const item = JSON.stringify([{}]);
      const description = `Deposit for contract ${contractId}`;

      const orderData: CreateOrderPayload = {
        app_trans_id,
        app_user,
        amount,
        embed_data,
        item,
        description,
      };

      const response = await createOrder.mutateAsync(orderData);
      console.log("Order Response:", response);

      if (response.data.return_code === 1) {
        window.location.href = response.data?.order_url;
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  // Handle contract extension request
  const handleExtension = async () => {
    if (!extensionDate) {
      toast.error("Please select a new extension date.");
      return;
    }

    try {
      await requestExtension.mutateAsync(extensionDate);
      toast.success("Extension request sent successfully!");

      // Send notification to landlord
      const url_base = process.env.NEXT_PUBLIC_SITE_URL;
      await supabase.from("notifications").insert([
        {
          user_id: landlordId,
          title: "Extension request from tenant",
          message: `Tenant has requested an extension for contract ${contractId}. Please review.`,
          type: "contract",
          is_read: false,
          data: {
            url: `${url_base}/user/contracts/${contractId}`,
            contractId: contractId,
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error requesting extension:", error);
      toast.error(error.message || "Failed to request extension.");
    }
  };

  // Handle landlord confirmation of extension
  const handleLandlordConfirmExtension = async () => {
    try {
      await confirmExtension.mutateAsync();
      toast.success("Extension confirmed successfully!");

      // Send notification to tenant
      const url_base = process.env.NEXT_PUBLIC_SITE_URL;
      await supabase.from("notifications").insert([
        {
          user_id: tenantId,
          title: "Extension confirmed by landlord",
          message: `Landlord has confirmed the extension for contract ${contractId}.`,
          type: "contract",
          is_read: false,
          data: {
            url: `${url_base}/user/contracts/${contractId}`,
            contractId: contractId,
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error confirming extension:", error);
      toast.error(error.message || "Failed to confirm extension.");
    }
  };

  // Handle landlord contract signing
  const handleLandlordSign = async () => {
    try {
      await signByLandlord.mutateAsync();
      toast.success("Landlord signed the contract successfully!");

      queryClient.invalidateQueries({
        queryKey: ["contract", String(contractId)],
      });

      // Send notification to tenant
      const url_base = process.env.NEXT_PUBLIC_SITE_URL;
      await supabase.from("notifications").insert([
        {
          user_id: tenantId,
          title: "Contract signed by landlord",
          message:
            "Landlord has signed the contract. Please review and complete the procedure.",
          type: "contract",
          is_read: false,
          data: {
            url: `${url_base}/user/contracts/${contractId}`,
            contractId: contractId,
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error signing contract:", error);
      toast.error("Failed to sign the contract.");
    }
  };

  // Handle file selection for dispute evidence
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error!);
      }
    });

    if (errors.length > 0) {
      toast.error("File validation failed", {
        description: errors.join("; "),
      });
    }

    if (validFiles.length > 0) {
      setDisputeFiles((prev) => [...prev, ...validFiles]);
      const newUrls = validFiles.map((file) => URL.createObjectURL(file));
      setDisputeFileUrls((prev) => [...prev, ...newUrls]);
    }

    event.target.value = "";
  };

  // Remove file from dispute files
  const removeFile = (index: number) => {
    URL.revokeObjectURL(disputeFileUrls[index]);
    setDisputeFiles((prev) => prev.filter((_, i) => i !== index));
    setDisputeFileUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset dispute form
  const resetDisputeForm = () => {
    setDisputeReason("");
    setDisputeFiles([]);
    setDisputeFileUrls([]);
    setIsDisputeDialogOpen(false);
  };

  // Handle dispute creation
  const handleCreateDispute = async () => {
    // Validate required fields
    if (!disputeReason.trim()) {
      toast.error("Please enter dispute description.");
      return;
    }

    const wordCount = disputeReason.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 10) {
      toast.error("Dispute description must be at least 10 words.");
      return;
    }

    try {
      setIsUploadingFiles(true);

      // Upload files if any using the utility function
      let evidenceUrls: string[] = [];
      if (disputeFiles.length > 0) {
        const uploadResults = await uploadDisputeEvidenceFiles(
          disputeFiles,
          contractId as string
        );

        // Check for failed uploads
        const failedUploads = uploadResults.filter((result) => result.error);
        if (failedUploads.length > 0) {
          toast.error("Some files failed to upload", {
            description: failedUploads.map((f) => f.error).join("; "),
          });
        }

        // Get successful upload URLs
        evidenceUrls = uploadResults
          .filter((result) => !result.error)
          .map((result) => result.url);

        console.log("Uploaded evidence files:", evidenceUrls);
      }

      // Create dispute using the hook
      await createDispute.mutateAsync({
        contract_id: contractId as string,
        reason: disputeReason.trim(),
        evidence: evidenceUrls,
      });

      // Send notification to the other party
      const otherPartyId = isLandlord ? tenantId : landlordId;
      const url_base = process.env.NEXT_PUBLIC_SITE_URL;

      await supabase.from("notifications").insert([
        {
          user_id: otherPartyId,
          title: "New dispute created",
          message: `A dispute has been created for contract ${contractId}. Please review.`,
          type: "dispute",
          is_read: false,
          data: {
            url: `${url_base}/user/contracts/${contractId}`,
            contractId: contractId,
          },
        },
      ]);

      toast.success("Dispute created successfully!");

      // Invalidate and refetch dispute data to get the latest state
      queryClient.invalidateQueries({
        queryKey: ["dispute", contractId],
      });

      resetDisputeForm();
    } catch (error: any) {
      console.error("Error creating dispute:", error);
      toast.error(error.message || "Failed to create dispute.");
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Fetch tenant information
  useEffect(() => {
    if (!tenantId) return;

    supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", tenantId)
      .single()
      .then(({ data }) => setTenantInfo(data as SupabaseUser));
  }, [tenantId, supabase]);

  // Fetch landlord information
  useEffect(() => {
    if (!landlordId) return;

    supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", landlordId)
      .single()
      .then(({ data }) => setLandlordInfo(data as SupabaseUser));
  }, [landlordId, supabase]);

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      disputeFileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [disputeFileUrls]);

  // Loading state
  if (isLoadingContract) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // Calculate word count for dispute description
  const disputeWordCount = disputeReason
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const isDisputeFormValid = disputeReason.trim() && disputeWordCount >= 10;

  return (
    <div className="py-10 bg-primary-foreground">
      {/* Contract Book Component */}
      <ContractBook
        rentalFrom={new Date(rentalFrom)}
        rentalYears={String(rentalYears)}
        landlordInfo={landlordInfo}
        landlordDetail={landlordDetail}
        tenantInfo={tenantInfo}
        tenantDetail={tenantDetail}
        roomDetail={roomDetail}
        tenantChecked={tenantChecked}
        landlordChecked={landlordChecked}
        isLandlord={isLandlord}
        handleLandlordSign={handleLandlordSign}
      />

      {/* Deposit Section - Show when contract is signed by landlord but pending */}
      {tenantChecked && landlordChecked && !isLandlord && isContractPending && (
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 items-center">
          <div className="md:col-span-2">
            <h2 className="mb-5 text-4xl font-semibold">
              This contract has been signed by landlord
            </h2>
            <p className="text-xl">
              Please make a deposit{" "}
              <span
                className="text-blue-500 underline hover:text-blue-600 hover:cursor-pointer"
                onClick={handleCreateOrder}
              >
                here
              </span>{" "}
              to complete the procedure.
            </p>
          </div>
          <div className="md:col-span-1 flex justify-center items-center">
            <Image src={deposit} alt="Deposit" className="w-full mt-4" />
          </div>
        </div>
      )}

      {/* Contract Expiration Warning Section */}
      {tenantChecked &&
        landlordChecked &&
        !isLandlord &&
        isContractActive &&
        daysToEnd !== null &&
        daysToEnd <= 7 && (
          <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 items-center">
            <div className="md:col-span-2">
              <h2 className="mb-5 text-4xl font-semibold">
                This contract is about to expire
              </h2>
              <p className="text-xl">
                Please take action before{" "}
                <span className="font-semibold">{daysToEnd} days</span> left.
              </p>

              {/* Extension Date Picker */}
              <div className="mt-6">
                <Label htmlFor="extension-date" className="mr-1">
                  Select new extension date
                </Label>
                <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="extension-date"
                      className="w-48 justify-between font-normal"
                    >
                      {extensionDate
                        ? extensionDate.toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={extensionDate}
                      captionLayout="dropdown"
                      startMonth={new Date(new Date().getFullYear(), 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      onSelect={(date) => {
                        setExtensionDate(date);
                        setOpenDatePicker(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                onClick={handleExtension}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                disabled={!extensionDate || requestExtension.isPending}
              >
                {requestExtension.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Confirm Extension"
                )}
              </Button>
            </div>
            <div className="md:col-span-1 flex justify-center items-center">
              <Image src={expired} alt="Expired" className="w-full mt-4" />
            </div>
          </div>
        )}

      {/* Landlord Extension Confirmation Section */}
      {contractData?.pending_updates && isLandlord && (
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 items-center">
          <div className="md:col-span-2">
            <h2 className="mb-5 text-4xl font-semibold">
              Tenant has requested a contract extension
            </h2>
            <p className="text-xl">
              Please review and confirm the extension request.
            </p>
            <p className="mt-2 text-lg">
              <span className="font-semibold text-red-600">
                Requested new end date:
              </span>{" "}
              {contractData.pending_updates.new_end_date
                ? new Date(
                    contractData.pending_updates.new_end_date
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <div className="flex justify-start mt-4">
              <Button
                onClick={handleLandlordConfirmExtension}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={confirmExtension.isPending}
              >
                {confirmExtension.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Extension"
                )}
              </Button>
            </div>
          </div>
          <div className="md:col-span-1 flex justify-center items-center">
            <Image src={nonExpired} alt="Non-Expired" className="w-full mt-4" />
          </div>
        </div>
      )}

      {/* Dispute Section - Show only for active contracts */}
      {isContractActive && (!disputeData || disputeData.length === 0) && (
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 items-center">
          <div className="md:col-span-2">
            <h2 className="mb-5 text-4xl font-semibold">Dispute Resolution</h2>
            <p className="text-xl mb-4">
              If you have any disputes regarding the contract, please report
              them here.
            </p>

            <Dialog
              open={isDisputeDialogOpen}
              onOpenChange={setIsDisputeDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Create Dispute
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Dispute</DialogTitle>
                  <DialogDescription>
                    Describe the issue in detail and attach evidence if
                    available. All evidence will be reviewed by our support
                    team.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* Dispute Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="reason">
                      Dispute Description *
                      <span className="text-sm text-gray-500 ml-1">
                        (Minimum 10 words)
                      </span>
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Describe the issue in detail: what happened, when it occurred, why you're disputing, what resolution you're seeking..."
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500">
                      Current: {disputeWordCount} words
                      {disputeWordCount < 10 && disputeReason.trim() && (
                        <span className="text-red-500 ml-1">
                          (Need {10 - disputeWordCount} more)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* File Upload Section */}
                  <div className="grid gap-3">
                    <Label htmlFor="evidence">
                      Evidence Files (Optional)
                      <span className="text-sm text-gray-500 ml-1">
                        - Images, Documents (Max 5MB each)
                      </span>
                    </Label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                      <Input
                        id="evidence"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="evidence"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <span className="text-sm font-medium text-gray-700 mb-1">
                          Click to select files or drag and drop here
                        </span>
                        <span className="text-xs text-gray-500">
                          Supported: JPG, PNG, PDF, DOC, DOCX (Max 5MB each)
                        </span>
                      </label>
                    </div>

                    {/* Selected Files Display */}
                    {disputeFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Selected Files ({disputeFiles.length}):
                        </Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {disputeFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                  <span className="text-sm font-medium truncate max-w-[200px] block">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetDisputeForm}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateDispute}
                    disabled={
                      createDispute.isPending ||
                      isUploadingFiles ||
                      !isDisputeFormValid
                    }
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {createDispute.isPending || isUploadingFiles ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploadingFiles ? "Uploading..." : "Creating..."}
                      </>
                    ) : (
                      "Create Dispute"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="md:col-span-1 flex justify-center items-center">
            <Image src={dispute} alt="Dispute" className="w-full mt-4" />
          </div>
        </div>
      )}

      {/* Existing Dispute Information - Show when dispute exists */}
      {disputeData && disputeData.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          {/* Header with Status */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Dispute Case
                    </h2>
                    <p className="text-red-100 text-sm">
                      #{disputeData[0]._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    disputeData[0].status === "resolved"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : disputeData[0].status === "rejected"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  } font-medium px-3 py-1`}
                >
                  {disputeData[0].status === "resolved" && (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {disputeData[0].status === "rejected" && (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {disputeData[0].status === "pending" && (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {disputeData[0].status.charAt(0).toUpperCase() +
                    disputeData[0].status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Dispute Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-red-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Reported by
                    </h3>
                  </div>
                  <div className="pl-6">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {disputeData[0].disputer_info?.full_name ||
                        "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {disputeData[0].disputer_info?.email}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CalendarIcon className="h-4 w-4 text-red-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Submitted
                    </h3>
                  </div>
                  <div className="pl-6">
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(disputeData[0].createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(disputeData[0].createdAt).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-red-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Issue Description
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {disputeData[0].reason}
                  </p>
                </div>
              </div>

              {/* Evidence Files */}
              {disputeData[0].evidence &&
                disputeData[0].evidence.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Save className="h-4 w-4 text-red-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Evidence ({disputeData[0].evidence.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {disputeData[0].evidence.map(
                        (file: any, index: number) => {
                          const isImage = file.url
                            .toLowerCase()
                            .match(/\.(jpg|jpeg|png|gif|webp)$/);

                          return (
                            <div
                              key={index}
                              className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow group border-2 border-gray-200 hover:border-red-300"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              {isImage ? (
                                <img
                                  src={file.url}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-red-500">
                                  <FileText className="h-8 w-8 mb-2" />
                                  <span className="text-xs font-medium">
                                    Document
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Resolution Status */}
              {disputeData[0].resolution ? (
                <div
                  className={`rounded-lg p-4 border-l-4 ${
                    disputeData[0].resolution.decision === "disputer_wins"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : disputeData[0].resolution.decision === "rejected"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {disputeData[0].resolution.decision === "disputer_wins" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : disputeData[0].resolution.decision === "rejected" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <h3
                      className={`font-semibold ${
                        disputeData[0].resolution.decision === "disputer_wins"
                          ? "text-green-800 dark:text-green-200"
                          : disputeData[0].resolution.decision === "rejected"
                            ? "text-red-800 dark:text-red-200"
                            : "text-yellow-800 dark:text-yellow-200"
                      }`}
                    >
                      {disputeData[0].resolution.decision === "disputer_wins"
                        ? "Dispute Approved - Disputer Wins"
                        : disputeData[0].resolution.decision === "rejected"
                          ? "Dispute Rejected"
                          : "Under Review"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Resolved on{" "}
                    {new Date(
                      disputeData[0].resolution.resolved_at
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Admin Decision:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {disputeData[0].resolution.reason}
                    </p>
                  </div>
                  {disputeData[0].resolution.decision === "disputer_wins" && (
                    <div className="bg-green-100 dark:bg-green-800/30 rounded-md p-3 border border-green-200">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        ✅ Refund Processed: The deposit has been refunded to
                        your account.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Under Review
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your dispute is being reviewed by our support team. You'll
                    be notified once a decision is made.
                  </p>
                </div>
              )}

              {/* Transaction Info (if exists) */}
              {disputeData[0].transaction_id && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CircleDollarSign className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Related Transaction
                      </span>
                    </div>
                    {disputeData[0].transaction_id.zalo_payment?.amount && (
                      <span className="font-bold text-red-600">
                        {disputeData[0].transaction_id.zalo_payment.amount.toLocaleString()}{" "}
                        đ
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Transaction ID: #
                      {disputeData[0].transaction_id._id
                        .slice(-8)
                        .toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type:{" "}
                      {disputeData[0].transaction_id.type
                        .charAt(0)
                        .toUpperCase() +
                        disputeData[0].transaction_id.type.slice(1)}
                    </p>
                    {disputeData[0].transaction_id.zalo_payment
                      ?.app_trans_id && (
                      <p className="text-xs text-gray-500">
                        ZaloPay ID:{" "}
                        {
                          disputeData[0].transaction_id.zalo_payment
                            .app_trans_id
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
