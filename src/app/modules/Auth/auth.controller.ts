import httpStatus from "http-status";
// import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import AppError from "../../errors/AppError";

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, refreshToken, userInfo } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // use in production
    sameSite: "none",
    domain: "zlocker-five.vercel.app",
    maxAge: 3600 * 1000, // 1 hour in milliseconds
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    domain: "zlocker-five.vercel.app",
    maxAge: 365 * 24 * 3600 * 1000, // 1 year in milliseconds
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is logged in succesfully!",
    data: userInfo,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  // console.log(req.body);

  const result = await AuthServices.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password is updated succesfully!",
    data: result,
  });
});

const resendVerificationCode = catchAsync(async (req, res) => {
  // console.log(req.body);

  const { email } = req.body;

  const result = await AuthServices.resendEmailVarificationCode(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification code will send to your gmail succesfully!",
    data: result,
  });
});

const addUsername = catchAsync(async (req, res) => {
  // console.log(req.body);

  const result = await AuthServices.addUsername(
    req.user.email,
    req.body.username
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Username updated succesfully!",
    data: result,
  });
});

const verifyCode = catchAsync(async (req, res) => {
  // console.log(req.body);

  const { code, email } = req.body;

  const result = await AuthServices.verifyCode(code, email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Code verified succesfully!",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const result = await AuthServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset link is generated succesfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved succesfully!",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await AuthServices.getMe(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is retrieved succesfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong !");
  }

  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset succesfully!",
    data: result,
  });
});

const sendMail = catchAsync(async (req, res) => {
  const result = AuthServices.sendMailToDev(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset succesfully!",
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  changePassword,
  resendVerificationCode,
  addUsername,
  verifyCode,
  forgetPassword,
  refreshToken,
  getMe,
  resetPassword,
  sendMail,
};
