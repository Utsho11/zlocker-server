import { Request } from "express";
import AppError from "../../errors/AppError";
import { Image } from "./image.model";
import { v2 as cloudinary } from "cloudinary";

const getFileType = (mimetype: string, originalName: string): string => {
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf" || ext === "pdf") return "pdf";
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ext === "docx" || ext === "doc") return "docx";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "zip" || ext === "rar" || ext === "7z") return "zip";
  if (mimetype.startsWith("video/")) return "video";
  return "file";
};

const storeImageIntoDB = async (email: string, req: Request) => {
  if (!req.file || !req.file.path) {
    throw new AppError(400, "Please upload a valid file!");
  }

  const link = req.file.path;
  const publicId = req.file.filename;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const fileType = getFileType(req.file.mimetype || "", fileName);
  const resourceType = fileType === "image" ? "image" : fileType === "video" ? "video" : "raw";

  const data = {
    email,
    link,
    publicId,
    fileName,
    fileType,
    fileSize,
    resourceType,
  };

  const result = await Image.create(data);

  return result;
};

const getAllImageFromDB = async (email: string) => {
  const result = await Image.find({ email }).sort({ createdAt: -1 });

  return result;
};

const deleteImagefromDB = async (id: string, email: string) => {
  const file = await Image.findById(id);

  if (!file || file.email !== email) {
    throw new AppError(404, "File not found or unauthorized!");
  }

  try {
    // Try destroying image resource
    await cloudinary.uploader.destroy(file.publicId);
    // Also try raw resource type if it was a document
    await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
  } catch (err) {
    console.warn("Cloudinary destroy warning:", err);
  }

  await Image.findByIdAndDelete(id);

  return "File deleted successfully.";
};

export const ImageServices = {
  storeImageIntoDB,
  deleteImagefromDB,
  getAllImageFromDB,
};
