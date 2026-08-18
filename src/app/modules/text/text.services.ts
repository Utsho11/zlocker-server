import AppError from "../../errors/AppError";
import { Text } from "./text.model";
import { decrypt, encrypt } from "../../utils";

const createContentIntoDB = async (payload: {
  content: string;
  email: string;
}) => {
  const { content, email } = payload;

  const encryptedContent = encrypt(content);

  const data = {
    content: encryptedContent,
    author: email,
  };

  await Text.create(data);

  return "Text added successfully";
};

const getAllContentFromDB = async (email: string) => {
  const data = await Text.find({
    author: email,
  });

  const result = data.map((doc) => ({
    ...doc.toObject(), // convert Mongoose document to plain object
    content: decrypt(doc.content),
  }));

  // console.log(result);

  return result;
};

const getContentById = async (id: string, email: string) => {
  if (!id) {
    throw new AppError(400, "Content ID is missing!");
  }

  const data = await Text.findOne({ _id: id, author: email });

  if (!data) {
    throw new AppError(404, "Content not found or unauthorized!");
  }

  const decryptedContent = decrypt(data.content);
  return { ...data.toObject(), content: decryptedContent };
};

const updateContent = async (id: string, email: string, content: string) => {
  if (!id) {
    throw new AppError(400, "Content ID is missing!");
  }

  const encryptedContent = encrypt(content);

  const result = await Text.findOneAndUpdate(
    { _id: id, author: email },
    { content: encryptedContent },
    { new: true } // returns the updated document
  );

  if (!result) {
    throw new AppError(404, "Content not found or unauthorized!");
  }

  return "Content Updated Successfully";
};

const deleteContent = async (id: string, email: string) => {
  if (!id) {
    throw new AppError(400, "Content ID is missing!");
  }

  const result = await Text.findOneAndDelete({ _id: id, author: email });

  if (!result) {
    throw new AppError(404, "Content not found or unauthorized!");
  }

  return "Content deleted successfully!";
};

export const TextServices = {
  createContentIntoDB,
  getAllContentFromDB,
  getContentById,
  updateContent,
  deleteContent,
};
