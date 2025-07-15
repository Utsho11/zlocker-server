import { createClerkClient } from "@clerk/express";
import config from "../config";

export const clerkClient = createClerkClient({
  secretKey: config.clerk_secret_key,
});
