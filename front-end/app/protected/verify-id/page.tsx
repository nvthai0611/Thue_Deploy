"use client";

import id_back from "@/assets/id-back.png";
import id_front from "@/assets/id-front.png";
import scan from "@/assets/scan.png";
import scan2 from "@/assets/scan-2.png";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "@/queries/user.queries";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Terminal } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyId() {
  const fpt_api_key = process.env.NEXT_PUBLIC_FPT_API_KEY;

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontLoading, setFrontLoading] = useState<boolean>(false);
  const [backLoading, setBackLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  // useQuery
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUser();
  const userId = useUserStore((state) => state.userId);
  const router = useRouter();

  const handleUpdate = () => {
    setUpdateLoading(true);
    setAlert(null);
    if (!frontResult || !backResult) {
      setAlert({
        type: "error",
        message: "Error!",
        detail: "Please scan both front and back sides before updating.",
      });
      setUpdateLoading(false);
      return;
    }

    // Helper to convert dd/mm/yyyy to ISO string
    const parseDate = (dateStr: string) => {
      if (!dateStr || dateStr === "N/A") return undefined;
      const [day, month, year] = dateStr.split("/");
      if (!day || !month || !year) return undefined;
      return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    };

    // Prepare user detail object
    const userDetail = {
      identity_card: {
        id_number: frontResult.id || backResult.mrz_details?.id,
        full_name: frontResult.name || backResult.mrz_details?.name,
        gender: frontResult.sex || backResult.mrz_details?.sex,
        date_of_birth: parseDate(
          frontResult.dob || backResult.mrz_details?.dob
        ),
        nationality:
          frontResult.nationality || backResult.mrz_details?.nationality,
        issue_date: parseDate(backResult.issue_date),
        expiry_date: parseDate(frontResult.doe || backResult.mrz_details?.doe),
        place_of_origin: frontResult.home,
        place_of_residence: frontResult.address,
        personal_identification_number: frontResult.id,
        issued_by: backResult.issue_loc,
        card_type: frontResult.type || backResult.type,
      },
    };

    updateUserMutation.mutate(
      { userDetail },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          toast.success("Identity updated successfully!");
          setUpdateLoading(false);
          router.push(`/user/${userId}`);
        },
        onError: (error: any) => {
          setAlert({
            type: "error",
            message: "Update failed!",
            detail: error?.message || "Unknown error.",
          });
          setUpdateLoading(false);
        },
      }
    );
  };

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    detail?: string;
  } | null>(null);

  const [frontResult, setFrontResult] = useState<any>(null);
  const [backResult, setBackResult] = useState<any>(null);

  // Acceptable types for front and back (from FPT.AI docs and response samples)
  const FRONT_TYPES = ["old", "new", "chip_front"];
  const BACK_TYPES = ["old_back", "new_back", "chip_back"];

  // Handle file change for front side
  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrontFile(e.target.files?.[0] || null);
    setAlert(null);
    setFrontResult(null);
  };

  // Handle file change for back side
  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackFile(e.target.files?.[0] || null);
    setAlert(null);
    setBackResult(null);
  };

  // Submit front image to FPT.AI OCR API
  // Only accept result if type is one of FRONT_TYPES
  const handleSubmitFront = async () => {
    setFrontLoading(true);
    if (!frontFile) {
      setAlert({
        type: "error",
        message: "Error!",
        detail: "Please select an image.",
      });
      setFrontLoading(false);
      return;
    }
    if (!fpt_api_key) {
      setAlert({
        type: "error",
        message: "Error!",
        detail: "FPT API key is missing.",
      });
      setFrontLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", frontFile);

    try {
      const res = await fetch("https://api.fpt.ai/vision/idr/vnm/", {
        method: "POST",
        headers: {
          api_key: fpt_api_key,
        } as any,
        body: formData,
      });

      const data = await res.json();

      if (data.errorCode === 0 && data.data?.[0]) {
        const type = data.data[0].type;
        // Accept only valid front side types
        if (FRONT_TYPES.includes(type)) {
          setFrontResult(data.data[0]);
          setAlert({
            type: "success",
            message: "Front image recognized!",
            detail: "Successfully recognized the front side.",
          });
        } else {
          setFrontResult(null);
          setAlert({
            type: "error",
            message: "Wrong side!",
            detail:
              "Please upload the front side of your ID/CCCD. Detected: " + type,
          });
        }
      } else {
        setFrontResult(null);
        setAlert({
          type: "error",
          message: "Recognition failed!",
          detail: data.errorMessage || "Unknown error.",
        });
      }
    } catch (err) {
      setFrontResult(null);
      setAlert({
        type: "error",
        message: "Error!",
        detail: "Failed to upload or recognize the image.",
      });
    } finally {
      setFrontLoading(false);
    }
  };

  // Submit back image to FPT.AI OCR API
  // Only accept result if type is one of BACK_TYPES
  const handleSubmitBack = async () => {
    setBackLoading(true);
    if (!backFile) {
      setAlert({
        type: "error",
        message: "Error!",
        detail: "Please select an image.",
      });
      setBackLoading(false);
      return;
    }
    if (!fpt_api_key) {
      setAlert({
        type: "error",
        message: "Error!",
        detail: "FPT API key is missing.",
      });
      setBackLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", backFile);

    try {
      const res = await fetch("https://api.fpt.ai/vision/idr/vnm/", {
        method: "POST",
        headers: {
          api_key: fpt_api_key,
        } as any,
        body: formData,
      });

      const data = await res.json();

      if (data.errorCode === 0 && data.data?.[0]) {
        const type = data.data[0].type;
        // Accept only valid back side types
        if (BACK_TYPES.includes(type)) {
          setBackResult(data.data[0]);
          setAlert({
            type: "success",
            message: "Back image recognized!",
            detail: "Successfully recognized the back side.",
          });
        } else {
          setBackResult(null);
          setAlert({
            type: "error",
            message: "Wrong side!",
            detail:
              "Please upload the back side of your ID/CCCD. Detected: " + type,
          });
        }
      } else {
        setBackResult(null);
        setAlert({
          type: "error",
          message: "Recognition failed!",
          detail: data.errorMessage || "Unknown error.",
        });
      }
    } catch (err) {
      setBackResult(null);
      setAlert({
        type: "error",
        message: "Error!",
        detail: "Failed to upload or recognize the image.",
      });
    } finally {
      setBackLoading(false);
    }
  };

  return (
    <div className="bg-primary-foreground">
      {/* Header */}
      <header className="h-[400px] bg-gradient-to-t from-red-400 to-red-700 flex justify-center">
        <div className="lg:w-2/3 md:columns-2 gap-4">
          <div className="h-full flex flex-col justify-center items-start p-8 gap-4">
            <div className="uppercase text-blue-300">Identity Verification</div>
            <div className="text-4xl font-semibold">
              Verify your identity in just 2 steps
            </div>
            <div>
              We will need a photo of your ID document. This will only take a
              few minutes.
            </div>
          </div>
          <div className="justify-center items-center hidden md:flex">
            <Image src={scan} alt="Verify ID" className="object-cover" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="py-10 mx-auto max-w-5xl bg-background">
        <div className="px-10">
          <span className="text-6xl font-semibold italic">Step 1: </span>
          <span className="text-3xl italic">Scan your ID</span>
        </div>
        <hr className="my-5" />
        <div className="md:flex justify-between gap-8">
          {/* Front side */}
          <div className="flex-1 flex flex-col items-center">
            <p className="font-semibold">Front side</p>
            <Image
              src={id_front}
              alt="Verify ID"
              className="object-cover -my-8 mx-auto"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleFrontChange}
              className="w-1/2 mx-auto"
            />
            <div className="flex justify-center mt-4 w-full">
              <Button
                className="w-[100px] mx-auto bg-red-600 hover:bg-red-700 text-white"
                onClick={handleSubmitFront}
                disabled={frontLoading}
              >
                {frontLoading ? (
                  <Loader2 className="animate-spin h-6 w-6 text-white mx-auto" />
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>

          {/* Back side */}
          <div className="flex-1 flex flex-col items-center">
            <p className="font-semibold">Back side</p>
            <Image
              src={id_back}
              alt="Verify ID"
              className="object-cover -my-8 mx-auto"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleBackChange}
              className="w-1/2 mx-auto"
            />
            <div className="flex justify-center mt-4 w-full">
              <Button
                className="w-[100px] mx-auto bg-red-600 hover:bg-red-700 text-white"
                onClick={handleSubmitBack}
                disabled={backLoading}
              >
                {backLoading ? (
                  <Loader2 className="animate-spin h-6 w-6 text-white mx-auto" />
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mx-auto mt-8 px-5">
            <Alert variant={alert.type === "error" ? "destructive" : "default"}>
              {alert.type === "error" ? (
                <Terminal className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle>{alert.message}</AlertTitle>
              <AlertDescription>{alert.detail}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* JSON Results */}
        {(frontResult || backResult) && (
          <div className="mt-8 grid md:grid-cols-2 gap-8 px-5">
            {/* Front Side */}
            <div className="p-2 min-h-[50px]">
              {frontResult ? (
                <div className="text-sm flex flex-col gap-2">
                  <div>
                    <b>Name:</b> {frontResult.name}
                  </div>
                  <div>
                    <b>Sex:</b> {frontResult.sex}
                  </div>
                  <div>
                    <b>Nationality:</b> {frontResult.nationality}
                  </div>
                  <div>
                    <b>Address:</b> {frontResult.address}
                  </div>
                  <div>
                    <b>Date of Birth:</b> {frontResult.dob}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">No result</span>
              )}
            </div>
            {/* Back Side */}
            <div className="p-2 min-h-[120px]">
              {backResult ? (
                <div className="text-sm flex flex-col gap-2">
                  <div>
                    <b>Features:</b> {backResult.features}
                  </div>
                  <div>
                    <b>Issue Date:</b> {backResult.issue_date}
                  </div>
                  <div>
                    <b>Issue Location:</b> {backResult.issue_loc}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">No result</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-32 flex flex-col justify-center">
          <div className="px-10">
            <span className="text-6xl font-semibold italic">Step 2: </span>
            <span className="text-3xl italic">Update your information</span>
          </div>
          <hr className="my-5" />
          <Image
            src={scan2}
            alt="Verify ID"
            className="object-cover mx-auto w-[300px] "
          />
          <Button
            className="w-[100px] mx-auto bg-red-600 hover:bg-red-700 text-white -mt-10"
            onClick={handleUpdate}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <Loader2 className="animate-spin h-6 w-6 text-white mx-auto" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
