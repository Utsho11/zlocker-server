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
    message: "Content is added succesfully",
    data: result,
  });
});

const getAllContent = catchAsync(async (req, res) => {
  const email = req.user?.email;
  const result = await TextServices.getAllContentFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All contents are fetched succesfully",
    data: result,
  });
});

const getSingleContent = catchAsync(async (req, res) => {
  const id = req.params.id;
  // console.log("id", req.params.id);

  const result = await TextServices.getContentById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Content is fetched succesfully",
    data: result,
  });
});

const updateContent = catchAsync(async (req, res) => {
  const id = req.params.id;
  const { content } = req.body;
  // console.log("id", req.params.id);

  const result = await TextServices.updateContent(id as string, content);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Content is updated succesfully",
    data: result,
  });
});

const deleteContent = catchAsync(async (req, res) => {
  const id = req.params.id;
  console.log(id);
  // console.log("id", req.params.id);

  const result = await TextServices.deleteContent(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Content is deleted succesfully",
    data: result,
  });
});

export const TextControllers = {
  createContent,
  getAllContent,
  getSingleContent,
  updateContent,
  deleteContent,
};
