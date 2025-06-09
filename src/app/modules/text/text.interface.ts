import { Model } from "mongoose";

export interface IText {
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextModel extends Model<IText> {
  isTextExistsById(id: string): Promise<IText>;
}
