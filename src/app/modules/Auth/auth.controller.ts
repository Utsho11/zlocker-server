import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";

const sendMail = catchAsync(async (req, res) => {
  const result = await AuthServices.sendMailToDev(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent successfully!",
    data: result,
  });
});

export const AuthControllers = {
  sendMail,
};
