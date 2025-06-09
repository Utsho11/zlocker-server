import { User } from "../User/user.model";
import AppError from "../../errors/AppError";
import { Text } from "./text.model";
import { encrypt } from "../../utils";

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

export const TextServices = {
  createContentIntoDB,
};
