"use client";

import { CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useGetOneUser } from "@/queries/user.queries";
import { Button } from "@/components/ui/button";
import { useLandlordRegistration } from "@/store/landlord-registration";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function PropertyDocumentPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { data: userDetail } = useGetOneUser(userId);
  const [propertyDocument, setPropertyDocument] = useState<any>(null);
  const { setTitle, setDescription, setSelectedFiles } =
    useLandlordRegistration();
  const router = useRouter();

  const handleResubmit = async () => {
    if (!propertyDocument) return;

    setTitle(propertyDocument.type || "");
    setDescription(propertyDocument.description || "");

    const fetchedFiles: File[] = await Promise.all(
      (propertyDocument.image || []).map(async (img: any) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        const file = new File([blob], `image.${img.type}`, { type: blob.type });
        return file;
      })
    );

    setSelectedFiles(fetchedFiles);

    router.push("/landlord/register/property-document");
  };

  useEffect(() => {
    const userStoreData = localStorage.getItem("user-store");

    if (userStoreData) {
      try {
        const parsedData = JSON.parse(userStoreData);
        const storedUserId = parsedData.state.userId;
        setUserId(storedUserId);
      } catch (error) {
        console.error("Error parsing user store data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userDetail?.property_document) {
      setPropertyDocument(userDetail.property_document);
    }
  }, [userDetail]);

  console.log(userDetail);

  return (
    <>
      <CardTitle className="text-lg font-semibold text-secondary-foreground">
        Property Document
      </CardTitle>

      {propertyDocument ? (
        <div className="mt-6 space-y-6 bg-background dark:bg-zinc-900 border border-primary-foreground dark:border-zinc-700 rounded-2xl p-6 shadow-md">
          <div>
            <p className="text-xs text-secondary-foreground mb-1">Title</p>
            <p className="text-base font-medium text-secondary-foreground">
              {propertyDocument?.type}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Description
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300">
              {propertyDocument?.description}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Images
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {propertyDocument?.image?.map((image: any, index: number) => (
                <img
                  key={index}
                  src={image?.url}
                  className="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-zinc-700"
                  alt={`Property image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 
            <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Reason
            </p>
            <p className="text-base text-gray-700 dark:text-gray-300">
              thay tuan ve mo dep trai
            </p>
          </div>
          */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Status
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900">
                {propertyDocument?.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Uploaded At
              </p>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {propertyDocument?.uploaded_at
                  ? format(
                      new Date(propertyDocument.uploaded_at),
                      "dd MMMM yyyy",
                      { locale: vi }
                    )
                  : "N/A"}
              </p>
            </div>
          </div>

          {propertyDocument?.status === "rejected" && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleResubmit}>Resubmit</Button>
            </div>
          )}
        </div>
      ) : (
        <h2 className="text-gray-600 dark:text-gray-300">No information</h2>
      )}
    </>
  );
}
