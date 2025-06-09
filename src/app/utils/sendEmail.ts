import nodemailer from "nodemailer";
import config from "../config";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: config.NODE_ENV === "production",
    auth: {
      user: "zlocker2025@gmail.com",
      pass: "djis dpit gqsd rdsn",
    },
  });

  await transporter.sendMail({
    from: "zlocker", // sender address
    to,
    subject: subject, // Subject line
    text: text,
    html: html, // html body
  });
};
