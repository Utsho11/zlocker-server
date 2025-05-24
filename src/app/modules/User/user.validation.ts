import { z } from "zod";
import { UserStatus } from "./user.constant";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().min(1, {
      message: "Please enter an email or username.",
    }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters long",
    }),
  }),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  changeStatusValidationSchema,
};
