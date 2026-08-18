import { Request } from "express";
import { v2 as cloudinary } from "cloudinary";
import AppError from "../../errors/AppError";
import { GuestFile, GuestText } from "./guest.model";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Helper to determine file category
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

// Automatic cleanup service for expired Cloudinary assets and MongoDB docs
const cleanupExpiredGuestData = async () => {
  try {
    const now = new Date();
    // Find all expired guest files
    const expiredFiles = await GuestFile.find({ expiresAt: { $lte: now } });

    for (const file of expiredFiles) {
      try {
        await cloudinary.uploader.destroy(file.publicId);
        await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
      } catch (err) {
        console.warn(`Failed to destroy Cloudinary asset ${file.publicId}:`, err);
      }
    }

    // Delete DB records
    if (expiredFiles.length > 0) {
      await GuestFile.deleteMany({ expiresAt: { $lte: now } });
    }
    await GuestText.deleteMany({ expiresAt: { $lte: now } });

    return { cleanedFilesCount: expiredFiles.length };
  } catch (error) {
    console.error("Error running guest data cleanup:", error);
    return { cleanedFilesCount: 0 };
  }
};

const getGuestLocker = async (lockerId: string) => {
  // Trigger cleanup lazily in background
  cleanupExpiredGuestData().catch(console.error);

  const cleanLockerId = lockerId.trim().toLowerCase();
  const texts = await GuestText.find({ lockerId: cleanLockerId }).sort({ createdAt: -1 });
  const files = await GuestFile.find({ lockerId: cleanLockerId }).sort({ createdAt: -1 });

  // Determine latest expiration or default 24h from now
  let expiresAt: Date | null = null;
  if (texts.length > 0 && texts[0].expiresAt) {
    expiresAt = texts[0].expiresAt;
  } else if (files.length > 0 && files[0].expiresAt) {
    expiresAt = files[0].expiresAt;
  }

  return {
    lockerId: cleanLockerId,
    texts,
    files,
    expiresAt: expiresAt || new Date(Date.now() + TWENTY_FOUR_HOURS_MS),
  };
};

const saveGuestText = async (lockerId: string, content: string) => {
  const cleanLockerId = lockerId.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + TWENTY_FOUR_HOURS_MS);

  // Check if a note already exists for this lockerId
  const existing = await GuestText.findOne({ lockerId: cleanLockerId });

  if (existing) {
    existing.content = content;
    existing.expiresAt = expiresAt;
    await existing.save();
    return existing;
  }

  const newText = await GuestText.create({
    lockerId: cleanLockerId,
    content,
    expiresAt,
  });

  return newText;
};

const uploadGuestFile = async (lockerId: string, req: Request) => {
  if (!req.file || !req.file.path) {
    throw new AppError(400, "Please upload a valid file!");
  }

  const cleanLockerId = lockerId.trim().toLowerCase();
  
  // Enforce Guest limit: max 3 files
  const currentCount = await GuestFile.countDocuments({ lockerId: cleanLockerId });
  if (currentCount >= 3) {
    // Delete newly uploaded file from Cloudinary since limit exceeded
    try {
      await cloudinary.uploader.destroy(req.file.filename);
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    } catch {}
    throw new AppError(403, "Guest lockers are limited to 3 files/images. Please create an account for 5 files or Pro for unlimited.");
  }

  const link = req.file.path;
  const publicId = req.file.filename;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const fileType = getFileType(req.file.mimetype || "", fileName);
  const resourceType = fileType === "image" ? "image" : fileType === "video" ? "video" : "raw";
  const expiresAt = new Date(Date.now() + TWENTY_FOUR_HOURS_MS);

  const data = {
    lockerId: cleanLockerId,
    link,
    publicId,
    fileName,
    fileType,
    fileSize,
    resourceType,
    expiresAt,
  };

  const result = await GuestFile.create(data);

  return result;
};

const deleteGuestFile = async (lockerId: string, fileId: string) => {
  const cleanLockerId = lockerId.trim().toLowerCase();
  const file = await GuestFile.findOne({ _id: fileId, lockerId: cleanLockerId });

  if (!file) {
    throw new AppError(404, "Guest file not found!");
  }

  try {
    await cloudinary.uploader.destroy(file.publicId);
    await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
  } catch (err) {
    console.warn("Cloudinary destroy warning:", err);
  }

  await GuestFile.findByIdAndDelete(fileId);

  return "File deleted successfully.";
};

const deleteGuestLocker = async (lockerId: string) => {
  const cleanLockerId = lockerId.trim().toLowerCase();

  // Find all files in locker and destroy in Cloudinary
  const files = await GuestFile.find({ lockerId: cleanLockerId });
  for (const file of files) {
    try {
      await cloudinary.uploader.destroy(file.publicId);
      await cloudinary.uploader.destroy(file.publicId, { resource_type: "raw" });
    } catch (err) {
      console.warn("Error destroying file during locker deletion:", err);
    }
  }

  await GuestFile.deleteMany({ lockerId: cleanLockerId });
  await GuestText.deleteMany({ lockerId: cleanLockerId });

  return "Locker deleted successfully.";
};

export const GuestServices = {
  getGuestLocker,
  saveGuestText,
  uploadGuestFile,
  deleteGuestFile,
  deleteGuestLocker,
  cleanupExpiredGuestData,
};
