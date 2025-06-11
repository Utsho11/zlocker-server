import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ImageServices } from "./image.services";

const stroreImage = catchAsync(async (req, res) => {
  const email = req.user?.email;
  const result = await ImageServices.storeImageIntoDB(email, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image is stored succesfully",
    data: result,
  });
});

const getAllImage = catchAsync(async (req, res) => {
  const email = req.user?.email;
  const result = await ImageServices.getAllImageFromDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Images are fetched succesfully",
    data: result,
  });
});

const deleteImage = catchAsync(async (req, res) => {
  const id = req.params?.id;
  const result = await ImageServices.deleteImagefromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image is deleted succesfully",
    data: result,
  });
});

export const ImageControllers = {
  stroreImage,
  getAllImage,
  deleteImage,
};
