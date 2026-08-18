import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const removeExtension = (filename: string) => {
  return filename.split(".").slice(0, -1).join(".");
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    return {
      folder: "zlocker",
      resource_type: "auto",
      public_id: `${Date.now()}-${removeExtension(cleanName)}`,
    };
  },
});

export const fileUploader = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});
