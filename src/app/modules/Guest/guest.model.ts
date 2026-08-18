import { model, Schema } from "mongoose";
import { IGuestFile, IGuestText } from "./guest.interface";

// Schema for Guest Text / Notes with 24-hour TTL
const guestTextSchema = new Schema<IGuestText>(
  {
    lockerId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically deleted by MongoDB after expiry
    },
  },
  {
    timestamps: true,
  }
);

// Schema for Guest Files (PDF, PPTX, Images, ZIPs, Docs) with 24-hour TTL
const guestFileSchema = new Schema<IGuestFile>(
  {
    lockerId: {
      type: String,
      required: true,
      index: true,
    },
    link: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "file",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    resourceType: {
      type: String,
      default: "auto",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically deleted by MongoDB after expiry
    },
  },
  {
    timestamps: true,
  }
);

export const GuestText = model<IGuestText>("GuestText", guestTextSchema);
export const GuestFile = model<IGuestFile>("GuestFile", guestFileSchema);
