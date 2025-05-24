import bcrypt from "bcrypt";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/AppError";
import { User } from "../User/user.model";
import { TLoginUser } from "./auth.interface";
import {
  createToken,
  generateUnique6DigitCode,
  verifyToken,
} from "./auth.utils";
import { Request } from "express";
import { sendEmail } from "../../utils/sendEmail";
import { VerificationCode } from "./varification.model";
import { UserTemp } from "../User/user.temp.model";

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

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
    throw new AppError(httpStatus.FORBIDDEN, "Password does not matched");

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

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    1 * 24 * 3600
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // console.log({ userData });

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userData.email);

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
  // Start a MongoDB session

  try {
    // Find the verification code
    const isCodeAvailable = await VerificationCode.findOne({
      code,
      email,
    });

    if (!isCodeAvailable) {
      throw new AppError(404, "Code is not available for this email!");
    }

    if (code !== isCodeAvailable.code) {
      throw new AppError(400, "Code does not match!");
    }

    // Find the temporary user
    const userTemp = await UserTemp.findOne({
      email,
    });
    if (!userTemp) {
      throw new AppError(404, "Temporary user not found!");
    }

    // Create a new user in the User collection
    const newUser = await User.create({
      email: userTemp.email,
      password: userTemp.password,
      isVerified: true,
      createdAt: new Date(),
    });

    // Delete the temporary user and verification code
    await UserTemp.deleteOne({ email: userTemp.email });
    await VerificationCode.deleteOne({ code, email });

    const jwtPayload = {
      username: newUser?.username,
      email: newUser?.email,
      role: newUser.role as string,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      24 * 3600
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      1 * 24 * 3600
    );

    return {
      accessToken,
      refreshToken,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in verifyCode:", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal Server Error"
    );
  }
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

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

  const jwtPayload = {
    username: user.username,
    email: user.email,
    role: user.role as string,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    300
  );

  const resetUILink = `${config.reset_pass_ui_link}/resetPassword?email=${user.email}&token=${resetToken} `;

  const subject = "Reset Your Password";
  const text = `Here's your reset password link: ${resetUILink}`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <h2 style="color: #333;">Reset Your Password</h2>
    <p>Hi ${user.username},</p>
    <p>We received a request to reset your password. Click the button below to choose a new one:</p>
    <p style="text-align: center;">
      <a href="${resetUILink}" style="display: inline-block; padding: 12px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
    </p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>Thanks,<br>zLocker Team</p>
  </div>
</body>
</html>
`;

  await sendEmail(email, subject, text, html);

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

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

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
  }

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

const getMe = async (req: Request) => {
  const { email } = req.user;

  const user = await User.isUserExistsByEmail(email);

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

  return user;
};

const resetPassword = async (
  payload: { email: string; password: string },
  token: string
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

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

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string
  ) as JwtPayload;

  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, "You are forbidden!");
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  requestEmailVarification,
  addUsername,
  addEmail,
  verifyCode,
  forgetPassword,
  refreshToken,
  getMe,
  resetPassword,
};
