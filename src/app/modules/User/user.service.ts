import AppError from "../../errors/AppError";
import { User } from "./user.model";
import { isEmail } from "./user.utils";

interface PUser {
  emailORusername?: string;
  password: string;
}

const createUserIntoDB = async (payload: PUser) => {
  const email = isEmail(payload?.emailORusername as string);

  const isUserExists = email
    ? await User.isUserExistsByEmail(payload?.emailORusername as string)
    : await User.isUserExistsByUserName(payload?.emailORusername as string);

  if (isUserExists) {
    throw new AppError(409, "User already exists!!");
  }

  const savedData = {
    email: email ? payload.emailORusername : "",
    username: email ? "" : payload.emailORusername,
    password: payload.password,
    isVarified: false,
    isDeleted: false,
  };

  try {
    const res = await User.create(savedData);
    return res;
  } catch (error) {
    console.error(error);
    throw new AppError(500, "Failed to register this user. Please try again");
  }
};

export const UserServices = {
  createUserIntoDB,
};
