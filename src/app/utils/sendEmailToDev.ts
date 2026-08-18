import nodemailer from "nodemailer";
import config from "../config";

export const sendEmailToDev = async ({
  name,
  userEmail,
  message,
}: {
  name: string;
  userEmail: string;
  message: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // port 587 uses STARTTLS, so secure must be false
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  const subject = `New Contact Message from ${name}`;
  const text = `
You have received a new message from your contact form:

Name: ${name}
Email: ${userEmail}
Message: ${message}
`;

  const html = `
    <h3>New Contact Message from ZLocker</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Message:</strong><br/>${message}</p>
  `;

  await transporter.sendMail({
    from: `"${name}" <${userEmail}>`, // shows user as sender
    to: "zlocker2025@gmail.com", // receiver (you)
    subject,
    text,
    html,
  });
};
