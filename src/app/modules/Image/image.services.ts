import { Request } from "express";
import AppError from "../../errors/AppError";
import { Image } from "./image.model";
import { v2 as cloudinary } from "cloudinary";

const storeImageIntoDB = async (email: string, req: Request) => {
  const link = req.file?.path;
  const publicId = req.file?.filename;

  const data = {
    email,
    link,
    publicId,
  };

  await Image.create(data);

  return "Image stored Successfully.";
};

const getAllImageFromDB = async (email: string) => {
  const result = await Image.find({ email });

  // console.log(result);

  return result;
};

const deleteImagefromDB = async (id: string, email: string) => {
  const file = await Image.findById(id);

  if (!file || file.email !== email) {
    throw new AppError(404, "Image not found!!!");
  }

  await cloudinary.uploader.destroy(file.publicId);

  await Image.findByIdAndDelete(id);

  return "Image deleted.";
};

export const ImageServices = {
  storeImageIntoDB,
  deleteImagefromDB,
  getAllImageFromDB,
};
