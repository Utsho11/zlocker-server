import { User } from "../User/user.model";
import AppError from "../../errors/AppError";
import { Text } from "./text.model";
import { decrypt, encrypt } from "../../utils";

const createContentIntoDB = async (payload: {
  content: string;
  email: string;
}) => {
  const { content, email } = payload;
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.isDeleted) {
    throw new AppError(400, "User is deleted");
  }
  if (user.isVerified === false) {
    throw new AppError(400, "User is not verified");
  }

  const encryptedContent = encrypt(content);

  const data = {
    content: encryptedContent,
    author: user.email,
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

const getContentById = async (id: string) => {
  // console.log(id);

  if (!id) {
    throw new AppError(404, "ContentID is missing!");
  }

  const data = await Text.findById(id);
  // console.log(result);

  let result;

  if (data) {
    const decryptedContent = decrypt(data.content);

    result = { ...data.toObject(), content: decryptedContent };
  }

  return result;
};

const updateContent = async (id: string, content: string) => {
  if (!id) {
    throw new AppError(400, "Content ID is missing!");
  }

  const encryptedContent = encrypt(content);

  const result = await Text.findByIdAndUpdate(
    id,
    { content: encryptedContent },
    { new: true } // returns the updated document
  );

  if (!result) {
    throw new AppError(404, "Content not found!");
  }

  return "Content Updated Successfully";
};

const deleteContent = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Content ID is missing!");
  }

  const result = await Text.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(404, "Content not found!");
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
