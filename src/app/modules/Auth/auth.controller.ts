import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

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
  sendMail,
};
