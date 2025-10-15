import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

// Upload room images to Supabase storage
export const uploadRoomImages = async (
  files: File[],
  housingAreaId: string,
  roomId: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;

      // Create path: housing-area/[housingAreaId]/rooms/[roomId]/[fileName]
      const filePath = `housing-area/${housingAreaId}/rooms/${roomId}/${fileName}`;

      // Upload to Supabase storage bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  });

  return Promise.all(uploadPromises);
};

// Delete room image from Supabase storage
export const deleteImage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    return !error;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

// Upload single image (utility function)
export const uploadSingleImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: path,
    };
  } catch (error) {
    return {
      url: "",
      path: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

export const uploadHousingAreaImages = async (
  files: File[]
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `housing-area/${fileName}`;
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      console.log(error);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  });

  return Promise.all(uploadPromises);
};

export const uploadPropertyDocumentImages = async (
  files: File[]
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `property-document/${fileName}`;
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      console.log(error);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  });

  return Promise.all(uploadPromises);
};

export const uploadDisputeEvidenceFiles = async (
  files: File[],
  contractId: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `disputes/contract_${contractId}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      console.log(error);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  });

  return Promise.all(uploadPromises);
};
