import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { generateUnique6DigitCode } from "../Auth/auth.utils";
import { User } from "./user.model";

const createUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  // Step 1: Check if user already exists in main users collection
  const isUserExists = await User.isUserExistsByEmail(payload.email);
  if (isUserExists) {
    throw new AppError(
      409,
      "User already exists with this email! Please try a unique one."
    );
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 2: Create user
    await User.create(
      [
        {
          email: payload.email,
          password: payload.password,
          isVerified: false,
          isDeleted: false,
        },
      ],
      { session }
    );

    // Step 3: Generate code (you may want to move code saving inside transaction too)
    const code = await generateUnique6DigitCode(payload.email);

    // Step 4: Send verification email
    const subject = "zLocker Verification Code";
    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8" /><title>Email Verification</title></head>
        <body style="font-family: Arial; background: #f4f4f4; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h2>🔐 Email Verification</h2>
            <p>Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; color: #27ae60; text-align: center;">${code}</p>
            <p>This code will expire in <strong>2 minutes</strong>.</p>
            <hr />
            <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} zLocker. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
    const text = `Your verification code is ${code}. It expires in 2 minutes.`;

    await sendEmail(payload.email, subject, text, html);
    await session.commitTransaction();
    session.endSession();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(500, "Something went wrong.");
  }
};

export const UserServices = {
  createUserIntoDB,
};
