"use client";

import contract from "@/assets/contract.png";
import ContractBook from "@/components/contract-book";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/client";
import { SupabaseUser } from "@/lib/type";
import { useCreateContract } from "@/queries/contract.queries";
import { useGetRoomDetailByRoomId } from "@/queries/room.queries";
import { useGetOneUser } from "@/queries/user.queries";
import { useUserStore } from "@/store/useUserStore";
import html2pdf from "html2pdf.js";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const RentalContractBook: React.FC = () => {
  const [rentalYears, setRentalYears] = useState<string>("");
  const [tenantChecked, setTenantChecked] = useState(false);
  const [warning, setWarning] = useState<string>("");
  const contractRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = createClient();

  const [tenantInfo, setTenantInfo] = useState<SupabaseUser | null>(null);
  const [landlordInfo, setLandlordInfo] = useState<SupabaseUser | null>(null);
  const tenantId = useUserStore((state) => state.userId);
  const { roomId } = useParams<{ roomId: string }>();
  const { data: tenantDetail } = useGetOneUser(tenantId);
  const { data: roomDetail } = useGetRoomDetailByRoomId(roomId);
  const landlordId = roomDetail?.housing_area?.owner_id;
  const { data: landlordDetail } = useGetOneUser(landlordId);
  const createContract = useCreateContract(roomId);

  const handleExportPDF = () => {
    if (contractRef.current) {
      html2pdf()
        .set({
          margin: 10,
          filename: "rental-contract.pdf",
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(contractRef.current)
        .save();
    }
  };

  console.log("Tenant Info:", tenantInfo);

  const handleCreateContract = () => {
    if (!tenantInfo || !landlordInfo || !roomDetail) return;

    if (!rentalYears || Number(rentalYears) < 1) {
      setWarning("Please enter a valid rental period (at least 1 year).");
      return;
    }

    if (!tenantChecked) {
      setWarning("Please sign at the contract.");
      return;
    }

    // Prepare contract data
    const now = new Date();
    const years = Number(rentalYears);
    const endDate = new Date(now);
    endDate.setFullYear(now.getFullYear() + years);

    const contractData = {
      end_date: endDate.toISOString(),
    };

    createContract
      .mutateAsync(contractData)
      .then(async (data) => {
        const url_base = process.env.NEXT_PUBLIC_SITE_URL;
        await supabase.from("notifications").insert([
          {
            user_id: landlordInfo.auth_user_id,
            title: "Có hợp đồng mới cần xác nhận",
            message: `Người thuê ${tenantInfo.name || tenantInfo.email} vừa tạo hợp đồng mới cho phòng ${roomDetail.title}.`,
            type: "contract",
            is_read: false,
            data: {
              url: `${url_base}/user/contracts/${data._id}`,
              roomId: roomDetail.id,
            },
          },
        ]);
        toast.success("Contract created successfully!");
        router.push("/user/contracts");
      })
      .catch((error) => {
        console.error("Error creating contract:", error.message);
        toast.error(error.message || "Failed to create contract.");
      });

    setWarning("");
  };

  useEffect(() => {
    if (!tenantId) return;
    supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", tenantId)
      .single()
      .then(({ data }) => setTenantInfo(data as SupabaseUser));
  }, [tenantId, supabase]);

  useEffect(() => {
    if (!landlordId) return;
    supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", landlordId)
      .single()
      .then(({ data }) => setLandlordInfo(data as SupabaseUser));
  }, [landlordId, supabase]);

  const today = new Date();

  if (
    !tenantInfo ||
    !tenantDetail ||
    !landlordInfo ||
    !landlordDetail ||
    !roomDetail
  ) {
    return <Loader2 className="animate-spin w-8 h-[400px] mx-auto mt-20" />;
  }

  return (
    <div
      ref={contractRef}
      className="flex flex-col items-center min-h-screen bg-primary-foreground py-8 px-2 sm:px-4 md:px-8"
    >
      {/* ContractBook with flipBookRef handled inside */}
      <ContractBook
        contractRef={contractRef}
        rentalFrom={today}
        rentalYears={rentalYears}
        tenantChecked={tenantChecked}
        setTenantChecked={setTenantChecked}
        landlordInfo={landlordInfo}
        landlordDetail={landlordDetail}
        tenantInfo={tenantInfo}
        tenantDetail={tenantDetail}
        roomDetail={roomDetail}
      />

      <div className="flex flex-col sm:flex-row mt-8 justify-center items-center text-left text-2xl sm:text-3xl gap-4">
        <div>
          <div className="flex gap-4 mb-4 text-base lg:text-5xl items-center">
            <p>I want to rent in</p>
            <Input
              type="number"
              min={1}
              value={rentalYears}
              onChange={(e) => setRentalYears(e.target.value)}
              placeholder="Enter years"
              className="w-32 h-10 text-base text-center"
            />
            <span>years</span>
          </div>

          <div className="text-sm lg:text-2xl mb-2">
            After <span className="font-semibold text-red-500">reading</span>{" "}
            and
            <span className="font-semibold text-red-500">
              {" "}
              fully understanding
            </span>{" "}
            the contract,
            <br />
            please{" "}
            <button
              type="button"
              className="text-blue-600 underline hover:cursor-pointer font-semibold"
              onClick={handleCreateContract}
            >
              click here
            </button>{" "}
            to create a contract.
          </div>
          {warning && (
            <div className="text-red-500 text-base mb-2">{warning}</div>
          )}
        </div>
        <Image
          src={contract}
          alt="Contract"
          className="mx-auto mt-4 w-40 sm:w-56 md:w-64 lg:w-72 xl:w-80"
        />
      </div>
    </div>
  );
};

export default RentalContractBook;
