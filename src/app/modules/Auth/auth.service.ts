import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/AppError";
import { User } from "../User/user.model";
import { TLoginUser } from "./auth.interface";
import { createToken, generateUnique6DigitCode } from "./auth.utils";
import { Request } from "express";
import { sendEmail } from "../../utils/sendEmail";
import { VerificationCode } from "./varification.model";

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user =
    (await User.isUserExistsByEmail(payload.emailORusername)) ||
    (await User.isUserExistsByUserName(payload.emailORusername));

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //create token and sent to the  client

  const jwtPayload = {
    username: user?.username,
    email: user?.email,
    role: user.role as string,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    24 * 3600
  );

  return {
    accessToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // console.log({ userData });

  // checking if the user is exist
  const user =
    (await User.isUserExistsByEmail(userData.email)) ||
    (await User.isUserExistsByUserName(userData.username));

  // console.log({ user });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      username: userData?.username,
      email: userData?.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};

const requestEmailVarification = async (req: Request) => {
  const { email } = req.body;

  if (email !== req.user.email) {
    throw new AppError(500, "Email is not matched!");
  }

  const userByEmail = await User.isUserExistsByEmail(email);

  if (userByEmail && userByEmail?.isVerified) {
    throw new AppError(409, "This email has been verified already.");
  }

  const code = await generateUnique6DigitCode(email);
  const subject = "zlocker verification code.";
  const html = ` 
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 24px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #2c3e50;">🔐 Email Verification</h2>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <p style="font-size: 32px; font-weight: bold; color: #27ae60; text-align: center; margin: 24px 0;">${code}</p>
        <p style="font-size: 14px; color: #555;">
          This code will expire in <strong>2 minutes</strong>. Please enter it on the website to complete your email verification.
        </p>
        <hr style="margin-top: 32px; margin-bottom: 16px; border: none; border-top: 1px solid #ccc;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} zLocker. All rights reserved.
        </p>
      </div>
    </body>
  </html>
`;

  const text = `Your verification code is ${code}. It expires in 2 minutes.`;

  await sendEmail(email, subject, text, html);

  return null;
};

const addUsername = async (email: string, username: string) => {
  const isUsernameExists = await User.isUserExistsByUserName(username);
  if (isUsernameExists) {
    throw new AppError(
      409,
      "This username has been taken already! Please, try an unique one."
    );
  }

  await User.findOneAndUpdate(
    {
      email,
    },
    {
      username,
    }
  );

  return null;
};

const addEmail = async (email: string, username: string) => {
  const isUsernameExists = await User.isUserExistsByEmail(email);
  if (isUsernameExists) {
    throw new AppError(
      409,
      "This email has been taken already! Please, try an unique one."
    );
  }

  await User.findOneAndUpdate(
    {
      username,
    },
    {
      email,
    }
  );

  return null;
};

const verifyCode = async (code: string, email: string) => {
  const isCodeAvailable = await VerificationCode.findOne({ email });

  if (!isCodeAvailable) {
    throw new AppError(404, "Code not available for this email!");
  }
  if (code !== isCodeAvailable.code) {
    throw new AppError(404, "Code is not matched!");
  }
  try {
    await User.findOneAndUpdate(
      {
        email,
      },
      {
        isVerified: true,
      }
    );

    return null;
  } catch (error) {
    console.log(error);
    throw new AppError(500, "Internal Server Error");
  }
};

// const forgetPassword = async (userId: string) => {
//   // checking if the user is exist
//   const user = await User.isUserExistsByCustomId(userId);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
//   }
//   // checking if the user is already deleted
//   const isDeleted = user?.isDeleted;

//   if (isDeleted) {
//     throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
//   }

//   // checking if the user is blocked
//   const userStatus = user?.status;

//   if (userStatus === "blocked") {
//     throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
//   }

//   const jwtPayload = {
//     userId: user.id,
//     role: user.role,
//   };

//   const resetToken = createToken(
//     jwtPayload,
//     config.jwt_access_secret as string,
//     "10m"
//   );

//   const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;

//   sendEmail(user.email, resetUILink);

//   // console.log(resetUILink);
// };

// const resetPassword = async (
//   payload: { id: string; newPassword: string },
//   token: string
// ) => {
//   // checking if the user is exist
//   const user = await User.isUserExistsByCustomId(payload?.id);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
//   }
//   // checking if the user is already deleted
//   const isDeleted = user?.isDeleted;

//   if (isDeleted) {
//     throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
//   }

//   // checking if the user is blocked
//   const userStatus = user?.status;

//   if (userStatus === "blocked") {
//     throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
//   }

//   const decoded = jwt.verify(
//     token,
//     config.jwt_access_secret as string
//   ) as JwtPayload;

//   //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

//   if (payload.id !== decoded.userId) {
//     // console.log(payload.id, decoded.userId);
//     throw new AppError(httpStatus.FORBIDDEN, "You are forbidden!");
//   }

//   //hash new password
//   const newHashedPassword = await bcrypt.hash(
//     payload.newPassword,
//     Number(config.bcrypt_salt_rounds)
//   );

//   await User.findOneAndUpdate(
//     {
//       id: decoded.userId,
//       role: decoded.role,
//     },
//     {
//       password: newHashedPassword,
//       needsPasswordChange: false,
//       passwordChangedAt: new Date(),
//     }
//   );
// };

export const AuthServices = {
  loginUser,
  changePassword,
  requestEmailVarification,
  addUsername,
  addEmail,
  verifyCode,
  // forgetPassword,
  // resetPassword,
};
