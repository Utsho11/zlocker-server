import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import { sendEmail } from "../../utils/sendEmail";
import { generateUnique6DigitCode } from "../Auth/auth.utils";
import { User } from "./user.model";
import { UserTemp } from "./user.temp.model";

interface PUser {
  email: string;
  password: string;
}

const createTempUserIntoDB = async (payload: PUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isUserExists = await User.isUserExistsByEmail(
      payload?.email as string
    );
    if (isUserExists) {
      throw new AppError(
        409,
        "User already exists with this email!! Please try a unique one."
      );
    }

    // Step 1: Create temp user with session
    await UserTemp.create([payload], { session });
    // console.log({ tempUser });

    // Step 2: Generate code
    const code = await generateUnique6DigitCode(payload.email);

    // Step 3: Send verification email
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
           <p>This code will expire in <strong>2 minutes</strong>. Please enter it on the website to verify your email.</p>
           <hr /><p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} zLocker. All rights reserved.</p>
         </div>
       </body>
     </html>
    `;
    const text = `Your verification code is ${code}. It expires in 2 minutes.`;

    await sendEmail(payload.email, subject, text, html);

    // Step 4: Commit transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    throw new AppError(500, "Failed to register this user. Please try again");
  }
};

export const UserServices = {
  createTempUserIntoDB,
};
