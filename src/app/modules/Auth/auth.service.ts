import { Request } from "express";
import { sendEmailToDev } from "../../utils/sendEmailToDev";

const sendMailToDev = async (req: Request) => {
  const { name, email: userEmail, message } = req.body;

  await sendEmailToDev({ name, userEmail, message });
};

export const AuthServices = {
  sendMailToDev,
};
