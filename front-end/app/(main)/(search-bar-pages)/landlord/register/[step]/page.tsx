"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLandlordRegistration } from "@/store/landlord-registration";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useGetOneUser, useUpdateUser } from "@/queries/user.queries";
import { uploadPropertyDocumentImages } from "@/utils/supabase/upload-file";
import checked from "@/assets/checked-success.png";
import Image from "next/image";

const naviSlug = [
  { href: "property-document" },
  { href: "identification-information" },
  { href: "complete" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".mp4"];

function PropertyDocumentPage() {
  const router = useRouter();
  const { step: currentPage } = useParams();

  const {
    selectedFiles,
    title,
    description,
    setSelectedFiles,
    setTitle,
    setDescription,
  } = useLandlordRegistration();

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<any>(null);
  const { data: userDetail } = useGetOneUser(userId);
  const updateUserMutation = useUpdateUser();
  const [titleWarning, setTitleWarning] = useState<boolean>(false);
  const [descriptionWarning, setDescriptionWarning] = useState<boolean>(false);

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
        error: `File "${file.name}" has invalid format. Only JPEG, PNG, MP4 allowed.`,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
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
        setSelectedFiles([...selectedFiles, ...validFiles]);
      }
      event.target.value = "";
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const validateFlieds = (field: string, value: string) => {
    switch (field) {
      case "title":
        const miniWordsTitle = value.trim().split(" ").length <= 5;
        if (value.trim() === "" || miniWordsTitle) {
          setTitleWarning(true);
        } else {
          setTitleWarning(false);
        }
        break;
      case "description":
        const miniWordDes = value.trim().split(" ").length <= 10;
        if (value.trim() === "" || miniWordDes) {
          setDescriptionWarning(true);
        } else {
          setDescriptionWarning(false);
        }
        break;
    }
  };

  const handleBackPage = () => {
    const currentIndex = naviSlug.findIndex(
      (item) => item.href === currentPage
    );

    if (currentIndex > 0 && currentIndex <= naviSlug.length - 1) {
      const { href: currentSlug } = naviSlug[currentIndex - 1];
      router.push(`/landlord/register/${currentSlug}`);
    }
  };

  const handleSubmit = async (): Promise<boolean> => {
    // 1. Tải hình ảnh lên Supabase
    let property_documents: any[] = [];
    try {
      const uploadResults = await uploadPropertyDocumentImages(selectedFiles);
      const failed = uploadResults.filter((r) => r.error);

      if (failed.length > 0) {
        toast.error("Some images failed to upload", {
          description: failed.map((f) => f.error).join("; "),
        });
        return false;
      }

      property_documents = uploadResults
        .filter((r) => !r.error)
        .map((r) => ({
          url: r.url,
          type: r.path.split(".").pop(),
          uploaded_at: new Date().toISOString(),
        }));
    } catch (error) {
      toast.error("Cannot upload images");
      return false;
    }

    // 2. Cập nhật thông tin người dùng với property_document
    try {
      await updateUserMutation.mutateAsync({
        userDetail: {
          user_id: userId,
          property_document: {
            type: title,
            description: description,
            image: property_documents,
          },
        },
      });
      return true;
    } catch (error) {
      toast.error("Không thể cập nhật thông tin người dùng");
      return false;
    }
  };

  const handleNextPage = async () => {
    // Validate fields based on current page
    let hasError = false;

    // Only validate property document fields when on property-document page
    if (currentPage === "property-document") {
      validateFlieds("title", title);
      if (title.trim() === "" || title.trim().split(" ").length <= 5) {
        hasError = true;
      }

      validateFlieds("description", description);
      if (
        description.trim() === "" ||
        description.trim().split(" ").length <= 10
      ) {
        hasError = true;
      }

      if (selectedFiles.length === 0) {
        toast.error("Please upload at least one image");
        hasError = true;
      }

      if (hasError) {
        toast.error("Please fill in all fields");
        return;
      }
    }

    const currentIndex = naviSlug.findIndex(
      (item) => item.href === currentPage
    );

    if (currentIndex >= 0 && currentIndex < naviSlug.length - 1) {
      if (currentPage === "identification-information") {
        const isVerify = userDetail?.verified;
        if (!isVerify) {
          toast.error("Please verify your account first");
          return;
        }
        const isSuccess = await handleSubmit();
        if (!isSuccess) {
          return;
        }
      }

      const { href: currentSlug } = naviSlug[currentIndex + 1];
      router.push(`/landlord/register/${currentSlug}`);
    }
  };

  useEffect(() => {
    const userStoreData = localStorage.getItem("user-store");

    if (userStoreData) {
      try {
        const parsedData = JSON.parse(userStoreData);
        const userId = parsedData.state.userId;
        setUserId(userId);
      } catch (error) {
        console.error("Error parsing user store data:", error);
      }
    }

    if (!userId) return;
    async function fetchUser() {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", userId)
        .single();
      if (!error) setUser(user);
    }
    fetchUser();
  }, [userId]);

  return (
    <>
      {/* Page property document*/}
      {currentPage === "property-document" && (
        <div className="w-full h-full flex justify-center">
          <div className="max-w-xl w-full h-full">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-3 items-center">
                  <Label htmlFor="fileInput" className="font-medium w-20">
                    Image
                  </Label>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={triggerFileInput}
                    className="px-4 py-2 rounded-lg border hover:bg-opacity-10 hover:bg-gray-500 cursor-pointer flex gap-2 items-center transition-all duration-200 ease-in-out"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-sm font-medium">Add image</span>
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="flex flex-row gap-3 flex-wrap">
                    {selectedFiles.map((file: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-24 h-24 object-cover rounded-lg "
                          alt={`Preview ${index}`}
                        />
                        <Button
                          onClick={() => removeImage(index)}
                          className="cursor-pointer z-10 absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 w-4 h-4 flex items-center justify-center"
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity duration-200"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  className={`rounded-lg border ${titleWarning ? "border-red-300 " : "border-gray-300 "}  px-4 py-2`}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    validateFlieds("title", title);
                  }}
                  placeholder="Enter a descriptive title"
                />
                {titleWarning && (
                  <p className="text-red-600 text-sm mt-1 animate-fade-in">
                    Title is required. At least 5 words.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  className={`mb-4 rounded-lg border ${descriptionWarning ? "border-red-300 " : "border-gray-300 "} px-4 py-2 min-h-[120px]`}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    validateFlieds("description", description);
                  }}
                  placeholder="Enter a descriptive description"
                />
                {descriptionWarning && (
                  <p className="text-red-600 text-sm mt-1 animate-fade-in">
                    Description is required. At least 10 words.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page identification information */}
      {currentPage === "identification-information" && (
        <div className="w-full h-full flex justify-center">
          <div className="max-w-2xl w-full mx-auto p-6  flex flex-row gap-6">
            <div className="flex flex-col gap-5 flex-1">
              <h2 className="text-xl font-semibold  border-b pb-2 border-gray-200">
                Citizen ID
              </h2>
              {userDetail?.identity_card?.id_number ? (
                <>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label htmlFor="id_number" className="font-medium w-32">
                      ID number:
                    </Label>
                    <span className="">
                      {userDetail?.identity_card?.id_number}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label htmlFor="full_name" className="font-medium w-32">
                      Full name:
                    </Label>
                    <span className="">
                      {userDetail?.identity_card?.full_name}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label htmlFor="gender" className="font-medium w-32">
                      Gender:
                    </Label>
                    <span className="">
                      {userDetail?.identity_card?.gender}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label htmlFor="residence" className="font-medium w-32">
                      Residence:
                    </Label>
                    <span className="">
                      {userDetail?.identity_card?.place_of_residence}
                    </span>
                  </div>
                </>
              ) : (
                <span className="">
                  Click{" "}
                  <span
                    className="cursor-pointer underline text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    onClick={() => router.push(`/user/${userId}`)}
                  >
                    here
                  </span>{" "}
                  to update Citizen ID
                </span>
              )}
            </div>
            <div className="flex flex-col gap-5 w-[45%]">
              <h2 className="text-xl font-semibold  border-b pb-2 border-gray-200">
                Account
              </h2>
              <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                <Label htmlFor="phone" className="font-medium w-24">
                  Phone:
                </Label>
                {user?.phone ? (
                  <span className="">{user?.phone}</span>
                ) : (
                  <span className="">
                    Click{" "}
                    <span
                      className="cursor-pointer underline text-blue-600 font-medium hover:text-blue-800 transition-colors"
                      onClick={() => router.push(`/user/${userId}`)}
                    >
                      here
                    </span>{" "}
                    to update phone
                  </span>
                )}
              </div>
              {userDetail?.bank_account?.bank_name ? (
                <>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label htmlFor="bank_name" className="font-medium w-24">
                      Bank:
                    </Label>
                    <span className="">
                      {userDetail?.bank_account?.bank_name}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2   p-2 rounded-md transition-colors">
                    <Label
                      htmlFor="account_number"
                      className="font-medium w-24"
                    >
                      Account number:
                    </Label>
                    <span className="">
                      {userDetail?.bank_account?.account_number}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-row items-center gap-2 text-gray-700  p-2 rounded-md transition-colors">
                  <Label htmlFor="bank" className="font-medium w-24">
                    Bank:
                  </Label>
                  <span className="text-gray-600">
                    Click{" "}
                    <span
                      className="cursor-pointer underline text-blue-600 font-medium hover:text-blue-800 transition-colors"
                      onClick={() => router.push(`/user/${userId}`)}
                    >
                      here
                    </span>{" "}
                    to update bank
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page complete */}
      {currentPage === "complete" && (
        <div className="w-full h-full flex justify-center">
          <div className="max-w-xl w-full h-full">
            <div className="flex flex-col gap-4 items-center">
              <Image
                src={checked}
                alt="Background"
                width={300}
                height={300}
                className="object-cover"
                priority
              />
              <span className="text-center text-lg font-medium">
                You have successfully submitted your document. Please wait for
                admin approval within 24 hours.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="border-b border-primary-foreground w-full mt-2"></div>
      <div className="flex flex-row justify-between w-full mt-4">
        <Button
          variant="outline"
          onClick={handleBackPage}
          className={` ${currentPage === "property-document" ? "hidden" : ""} ml-6`}
        >
          Back
        </Button>
        <Button
          className={`ml-auto bg-red-600 hover:bg-red-700 mr-5 text-white ${currentPage === "complete" ? "hidden" : ""}`}
          onClick={handleNextPage}
        >
          {currentPage === "identification-information" ? "Submit" : "Next"}
        </Button>
      </div>
    </>
  );
}

export default PropertyDocumentPage;
