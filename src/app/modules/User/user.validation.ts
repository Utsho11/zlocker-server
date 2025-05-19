import { z } from "zod";
import { UserStatus } from "./user.constant";

export const createUserValidationSchema = z.object({
  body: z.object({
    emailORusername: z.string().min(1, {
      message: "Please enter an email or username.",
    }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters long",
    }),
  }),
});

const userValidationSchema = z.object({
  pasword: z
    .string({
      invalid_type_error: "Password must be string",
    })
    .max(20, { message: "Password can not be more than 20 characters" })
    .optional(),
});

const changeStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...UserStatus] as [string, ...string[]]),
  }),
});

export const UserValidation = {
  userValidationSchema,
  changeStatusValidationSchema,
};
