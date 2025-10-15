"use client";

import GGMap from "@/components/gg-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { Textarea } from "@/components/ui/textarea";
import { useAddHousingArea } from "@/queries/housing-area.queries";
import { useUserStore } from "@/store/useUserStore";
import { uploadHousingAreaImages } from "@/utils/supabase/upload-file";
import { useLoadScript } from "@react-google-maps/api";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Landlord", href: "/landlord" },
  { name: "Housing Area Details" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".mp4"];

export default function CreateHousingArea() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });
  const myUserId = useUserStore((state) => state.userId);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomNumber, setRoomNumber] = useState(""); // Room number state
  const [roomNumberWarning, setRoomNumberWarning] = useState(false); // Room number warning
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const addHousingAreaMutation = useAddHousingArea();
  const router = useRouter();

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

  // Address states
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Warning states
  const [showWarning, setShowWarning] = useState(false);
  const [descWarning, setDescWarning] = useState(false);
  const [titleWarning, setTitleWarning] = useState(false);
  const [locationWarning, setLocationWarning] = useState(false);
  const [imagesWarning, setImagesWarning] = useState(false);
  const [state, setState] = useState("");

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setImageFiles((prev) => [...prev, ...validFiles]);
        setImages((prev) => [
          ...prev,
          ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);
      }
      event.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // GGMap select handler
  const handleMapSelect = (
    address: string,
    cityValue: string,
    districtValue: string,
    latValue: number,
    lngValue: number,
    stateValue?: string
  ) => {
    setStreet(address);
    setCity(cityValue);
    setDistrict(districtValue);
    setLat(latValue);
    setLng(lngValue);
    setState(stateValue || "");
    if (address && address.trim() !== "") setLocationWarning(false);
  };

  // Description validation
  const isDescriptionValid =
    description.trim().split(/\s+/).filter(Boolean).length >= 5;

  // Form validation
  const isFormComplete =
    title.trim() !== "" &&
    isDescriptionValid &&
    street.trim() !== "" &&
    images.length >= 3 &&
    roomNumber.trim() !== "" &&
    lat !== null &&
    lng !== null;

  // Handle Create button click
  const handleCreate = async () => {
    if (title.trim() === "") {
      setTitleWarning(true);
    } else {
      setTitleWarning(false);
    }

    if (!isDescriptionValid) {
      setDescWarning(true);
    } else {
      setDescWarning(false);
    }

    if (roomNumber.trim() === "") {
      setRoomNumberWarning(true);
    } else {
      setRoomNumberWarning(false);
    }

    if (street.trim() === "" || lat === null || lng === null) {
      setLocationWarning(true);
    } else {
      setLocationWarning(false);
    }

    if (images.length < 3) {
      setImagesWarning(true);
    } else {
      setImagesWarning(false);
    }

    if (!isFormComplete) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    setIsLoading(true);

    // 1. Upload images to Supabase
    let uploadedImageUrls: string[] = [];
    let legal_documents: any[] = [];
    try {
      const uploadResults = await uploadHousingAreaImages(imageFiles);
      const failed = uploadResults.filter((r) => r.error);

      if (failed.length > 0) {
        toast.error("Some files failed to upload", {
          description: failed.map((f) => f.error).join("; "),
        });
      }

      uploadedImageUrls = uploadResults
        .filter((r) => !r.error)
        .map((r) => r.url);

      legal_documents = uploadResults
        .filter((r) => !r.error)
        .map((r) => ({
          url: r.url,
          type: r.path.split(".").pop(),
          uploaded_at: new Date().toISOString(),
        }));
    } catch (error) {
      toast.error("Failed to upload images");
      setIsLoading(false);
      return;
    }

    // 2. Call api to create housing area
    const payload = {
      owner_id: myUserId,
      housingArea: {
        name: title,
        description,
        location: {
          address: street,
          district,
          city: state,
          lat: lat,
          lng: lng,
        },
        expected_rooms: Number(roomNumber),
        legal_documents,
      },
    };
    await addHousingAreaMutation
      .mutateAsync(payload)
      .then(() => {
        toast.success("Housing area created successfully");
        setIsLoading(false);
        router.push("/landlord/my-ads/pending");
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create housing area"
        );
        setIsLoading(false);
        return;
      });
  };

  return (
    <div className="bg-primary-foreground px-4 md:px-6">
      <div className="max-w-5xl mx-auto bg-background p-6">
        <SimpleBreadcrumb items={breadcrumbItems} />
        <div className="bg-background mx-auto flex flex-col md:flex-row gap-8 p-6">
          <div className="md:w-1/5 pt-6">
            <h2 className="text-3xl font-semibold mb-4">Images</h2>
            <label
              className={`border border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${
                imagesWarning ? "border-red-300" : ""
              }`}
            >
              <ImagePlus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Add Image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <div className="grid grid-cols-4 gap-2 mt-5">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 w-4 h-4 flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-black" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You can upload up to 12 images. First image will be the cover
              image.
            </p>
            {imagesWarning && (
              <p className="text-red-600 text-sm mt-1">
                Please upload at least 3 images.
              </p>
            )}
          </div>
          <div className="md:w-4/5">
            <div className="bg-background rounded-lg md:p-6 mb-6">
              <h2 className="text-3xl font-semibold mb-4">
                Housing Area Details
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive title"
                    className={`mt-1 ${titleWarning ? "border border-red-300" : ""}`}
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (event.target.value.trim() !== "")
                        setTitleWarning(false);
                    }}
                  />
                  {titleWarning && (
                    <p className="text-red-600 text-sm mt-1">
                      Title is required.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail"
                    className={`mt-1 min-h-[150px] ${descWarning ? "border border-red-300" : ""}`}
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      if (
                        event.target.value.trim().split(/\s+/).filter(Boolean)
                          .length >= 5
                      ) {
                        setDescWarning(false);
                      }
                    }}
                  />
                  {descWarning && (
                    <p className="text-red-600 text-sm mt-1">
                      Description must be at least 5 words.
                    </p>
                  )}
                </div>

                {/* Room number */}
                <div>
                  <Label htmlFor="roomNumber">Room number</Label>
                  <Input
                    id="roomNumber"
                    type="number"
                    min={1}
                    placeholder="Enter number of rooms"
                    className={`mt-1 ${roomNumberWarning ? "border border-red-300" : ""}`}
                    value={roomNumber}
                    onChange={(event) => {
                      setRoomNumber(event.target.value);
                      if (event.target.value.trim() !== "")
                        setRoomNumberWarning(false);
                    }}
                  />
                  {roomNumberWarning && (
                    <p className="text-red-600 text-sm mt-1">
                      Room number is required.
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <Label>Location</Label>
                  <div
                    className={
                      locationWarning
                        ? "border border-red-300 rounded-md p-1"
                        : ""
                    }
                  >
                    <GGMap onSelect={handleMapSelect} isLoaded={isLoaded} />
                  </div>
                  {locationWarning && (
                    <p className="text-red-600 text-sm mt-1">
                      Please select a location.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4"></div>
            <div className="flex gap-4 justify-end px-6">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
