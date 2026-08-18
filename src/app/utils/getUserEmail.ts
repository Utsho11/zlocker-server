import { clerkClient, getAuth } from "@clerk/express";
import { Request } from "express";
import AppError from "../errors/AppError";

export const getUserEmail = async (req: Request) => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError(401, "Unauthorized access! Please login.");
  }

  const user = await clerkClient.users.getUser(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const email =
    user.emailAddresses?.[0]?.emailAddress ||
    user.primaryEmailAddressId ||
    userId;

  return email;
};
