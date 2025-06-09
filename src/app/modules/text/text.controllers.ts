import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TextServices } from "./text.services";
import httpStatus from "http-status";

const createContent = catchAsync(async (req, res) => {
  const { content } = req.body;
  const email = req.user?.email;
  const result = await TextServices.createContentIntoDB({ content, email });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is registered succesfully",
    data: result,
  });
});

export const TextControllers = {
  createContent,
};
