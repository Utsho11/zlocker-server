import { clerkClient, getAuth } from "@clerk/express";
import { Request } from "express";
import AppError from "../errors/AppError";

export const getUserEmail = async (req: Request) => {
  const { userId } = getAuth(req);

  const user = await clerkClient.users.getUser(userId as string);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user.emailAddresses[0].emailAddress;
};
