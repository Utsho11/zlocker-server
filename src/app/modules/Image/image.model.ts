import { model, Schema } from "mongoose";
import { IImage } from "./image.interface";

const textSchema = new Schema<IImage>(
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
  },
  {
    timestamps: true,
  }
);

export const Image = model<IImage>("Image", textSchema);
