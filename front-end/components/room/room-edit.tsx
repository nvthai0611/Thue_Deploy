"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import {
  deleteImage,
  UploadResult,
  uploadRoomImages,
} from "@/utils/supabase/upload-file";
import RoomInteriors from "./room-interiors";
import { Room } from "@/lib/type";
import { useUpdateRoom } from "@/queries/room.queries";
import { useQueryClient } from "@tanstack/react-query";

interface EditRoomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onRoomUpdated: (room: Room) => void;
}

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".mp4"];

export function EditRoomSheet({
  open,
  onOpenChange,
  room,
  onRoomUpdated,
}: EditRoomSheetProps) {
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;
  const params = useParams();
  const housingAreaId = params.id as string;
  console.log("Room Details:", room);

  const [formData, setFormData] = useState<Room | null>(null);
  const [priceValue, setPriceValue] = useState<number>(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateRoom } = useUpdateRoom();
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (room?.facilities) {
      setSelectedFacilities(room.facilities.map((f) => f.code));
    }
  }, [room]);

  const handleFacilitiesChange = (codes: number[]) => {
    setSelectedFacilities(codes);
  };

  // Format number to VND with English locale
  const formatToVND = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate file type and size
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File "${file.name}" is too large. Maximum size is 5MB. Current size: ${formatFileSize(file.size)}`,
      };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `File "${file.name}" has invalid format. Only JPEG, PNG images and MP4 videos are allowed.`,
      };
    }
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File "${file.name}" has invalid extension. Only .jpg, .jpeg, .png, .mp4 are allowed.`,
      };
    }
    return { isValid: true };
  };

  // Initialize form data when room changes
  useEffect(() => {
    if (room) {
      setFormData({ ...room });
      const price = Number(room.price) || 0;
      setPriceValue(price);
      setInitialImages(room.images.map((img) => img.url) || []);
      setExistingImages(room.images.map((img) => img.url) || []);
      setUploadedImages([]);
    }
  }, [room]);

  // Handle form field changes
  const handleFieldChange = (field: keyof Room, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Handle price input changes
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setPriceValue(value);
    handleFieldChange("price", value.toString());
  };

  // Handle image file upload with validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          errors.push(validation.error!);
        }
      });

      if (errors.length > 0) {
        toast.error("File validation failed", {
          description: errors.join("\n"),
        });
      }
      if (validFiles.length > 0) {
        setUploadedImages((prev) => [...prev, ...validFiles]);
      }
      e.target.value = "";
    }
  };

  // Remove uploaded image by index
  const removeUploadedImage = (index: number) => {
    const removedFile = uploadedImages[index];
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed "${removedFile.name}" from upload queue`);
  };

  // Remove existing image
  const removeExistingImage = async (index: number) => {
    const imageUrl = existingImages[index];
    const originalImageIndex = room?.images.findIndex(
      (img) => img.url === imageUrl
    );
    if (originalImageIndex !== undefined && originalImageIndex >= 0) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split("/");
        const filePath = pathParts.slice(-4).join("/");
        const deleted = await deleteImage(filePath);
        if (deleted) {
          toast.success("File deleted successfully");
        } else {
          toast.warning(
            "File removed from display but may still exist in storage"
          );
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete file", {
          description: "The file may still exist in storage",
        });
      }
    }
  };

  // Trigger hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload images to Supabase
  const uploadImages = async (): Promise<string[]> => {
    if (uploadedImages.length === 0) {
      return existingImages;
    }
    setUploadingImages(true);
    try {
      const uploadResults: UploadResult[] = await uploadRoomImages(
        uploadedImages,
        housingAreaId,
        formData!.id
      );
      const failedUploads = uploadResults.filter((result) => result.error);
      if (failedUploads.length > 0) {
        toast.error("Some files failed to upload", {
          description: `${failedUploads.length} out of ${uploadResults.length} files failed`,
        });
      }
      const successfulUrls = uploadResults
        .filter((result) => !result.error)
        .map((result) => result.url);
      return [...existingImages, ...successfulUrls];
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files", {
        description: "Please try again",
      });
      return existingImages;
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle save with API call
  const handleSave = async () => {
    if (!formData) return;
    try {
      setLoading(true);
      // 1. Upload new images and get all image URLs
      const newImageUrls = await uploadImages(); // string[]

      // 2. Find images that need to be deleted
      const urlsToDelete = initialImages.filter(
        (url) => !newImageUrls.includes(url)
      );

      // 3. Delete these files on Supabase
      for (const url of urlsToDelete) {
        try {
          const filePath = new URL(url).pathname.split(`/${bucketName}/`)[1];
          if (filePath) {
            await deleteImage(filePath);
          } else {
            console.log("Cannot extract filePath from url:", url);
          }
        } catch (e) {
          console.log(`Failed to delete image ${url}:`, e);
        }
      }

      const updatedRoom: Room = {
        ...formData,
        facilities: selectedFacilities,
        area: Number(formData.area),
        images: newImageUrls.map((url) => ({ url })),
        price: priceValue,
      };

      updateRoom(
        { id: formData.id, room: updatedRoom },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["rooms", housingAreaId],
            });
            queryClient.invalidateQueries({ queryKey: ["room", formData.id] });
            toast.success("Room updated successfully", {
              description: `Room ${formData.title} has been updated`,
            });
          },
          onError: () => {
            toast.error("Failed to update room", {
              description: "Please try again.",
            });
          },
        }
      );

      onOpenChange(false);
      setUploadedImages([]);
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error("Failed to update room", {
        description: "Please check your information and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="text-2xl">Edit Room</SheetTitle>
          <SheetDescription className="text-xs pb-2">
            Edit room information here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          <div className="space-y-6">
            {/* Room Title Input */}
            <div className="grid gap-3">
              <Label htmlFor="room-title">Room Title</Label>
              <Input
                id="room-title"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter room title"
                className="w-full"
                disabled={loading}
              />
            </div>
            {/* Room Area Input */}
            <div className="grid gap-3">
              <Label htmlFor="room-area">Room Area (m²)</Label>
              <Input
                id="room-area"
                type="number"
                value={formData.area}
                onChange={(e) => handleFieldChange("area", e.target.value)}
                placeholder="Enter room area"
                min={1}
                className="w-full"
                disabled={loading}
              />
            </div>
            {/* Room Type Selection */}
            <div className="grid gap-3">
              <Label htmlFor="room-type">Room Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleFieldChange("type", value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="SINGLE">
                      <Badge className="bg-blue-500 hover:bg-blue-600 rounded-sm">
                        SINGLE
                      </Badge>
                    </SelectItem>
                    <SelectItem value="COUPLE">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 rounded-sm">
                        COUPLE
                      </Badge>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Room Price Input with VND formatting */}
            <div className="grid gap-3">
              <Label htmlFor="room-price">Rental Price (VND)</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="room-price"
                    type="number"
                    placeholder="Enter rental price"
                    min={50000}
                    step={50000}
                    value={formData.price}
                    onChange={handlePriceChange}
                    className="pr-12"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    VND
                  </span>
                </div>
                {priceValue > 0 && (
                  <Badge className="bg-green-100 text-green-800">
                    {formatToVND(priceValue)} VND
                  </Badge>
                )}
              </div>
            </div>
            {/* Interiors */}
            <RoomInteriors
              checkedCodes={selectedFacilities}
              onChange={handleFacilitiesChange}
            />
            {/* Image Upload Section */}
            <div className="grid gap-3">
              <Label>Room Images & Videos</Label>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full h-20 border-dashed border-2 hover:bg-gray-50"
                  disabled={loading || uploadingImages}
                >
                  <div className="text-center flex flex-col items-center justify-center text-gray-600">
                    <Upload className="h-6 w-6 mr-2" />
                    Upload Images & Videos
                    <div className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, MP4 • Max 5MB each
                    </div>
                  </div>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,video/mp4,.jpg,.jpeg,.png,.mp4"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">
                      Existing Files ({existingImages.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative group"
                        >
                          {typeof imageUrl === "string" &&
                          imageUrl.includes(".mp4") ? (
                            <div className="relative">
                              <video
                                src={imageUrl}
                                className="w-full h-24 object-cover rounded-md border"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-md">
                                <span className="text-white text-xs font-medium">
                                  Video
                                </span>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={imageUrl}
                              alt={`Room Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={loading}
                            title="Delete file"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* New Uploaded Files Preview */}
                {uploadedImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-blue-700">
                      New Files to Upload ({uploadedImages.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          {file.type.startsWith("video/") ? (
                            <div className="relative">
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-24 object-cover rounded-md border border-blue-200"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-md">
                                <span className="text-white text-xs font-medium">
                                  Video
                                </span>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border border-blue-200"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={loading}
                            title="Remove file"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md">
                            <div className="truncate">
                              {file.name.length > 12
                                ? `${file.name.substring(0, 9)}...`
                                : file.name}
                            </div>
                            <div className="text-gray-300">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="flex-shrink-0 border-t pt-4 gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || uploadingImages}
            className="bg-red-500 hover:bg-red-700 text-white hover:text-white flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <SheetClose asChild>
            <Button
              variant="outline"
              type="button"
              disabled={loading || uploadingImages}
              className="flex-1"
            >
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
