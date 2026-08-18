import { model, Schema } from "mongoose";
import { IImage } from "./image.interface";

const imageSchema = new Schema<IImage>(
  {
    email: {
      type: String,
      required: true,
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
    },
    fileType: {
      type: String,
      default: "raw",
    },
    fileSize: {
      type: Number,
    },
    resourceType: {
      type: String,
      default: "auto",
    },
  },
  {
    timestamps: true,
  }
);

export const Image = model<IImage>("Image", imageSchema);
