import { model, Schema } from "mongoose";
import { IText, TextModel } from "./text.interface";

const textSchema = new Schema<IText, TextModel>(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

textSchema.statics.isTextExistsById = async function (
  id: string
): Promise<IText | null> {
  return await Text.findById(id);
};

export const Text = model<IText, TextModel>("Text", textSchema);
