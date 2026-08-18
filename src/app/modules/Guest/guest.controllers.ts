import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GuestServices } from "./guest.services";

const getGuestLocker = catchAsync(async (req: Request, res: Response) => {
  const { lockerId } = req.params;
  const result = await GuestServices.getGuestLocker(lockerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Guest locker retrieved successfully.",
    data: result,
  });
});

const saveGuestText = catchAsync(async (req: Request, res: Response) => {
  const { lockerId } = req.params;
  const { content } = req.body;
  const result = await GuestServices.saveGuestText(lockerId, content);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Guest note saved successfully (24-hour expiry active).",
    data: result,
  });
});

const uploadGuestFile = catchAsync(async (req: Request, res: Response) => {
  const { lockerId } = req.params;
  const result = await GuestServices.uploadGuestFile(lockerId, req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Guest file uploaded successfully.",
    data: result,
  });
});

const deleteGuestFile = catchAsync(async (req: Request, res: Response) => {
  const { lockerId, fileId } = req.params;
  const result = await GuestServices.deleteGuestFile(lockerId, fileId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result,
    data: null,
  });
});

const deleteGuestLocker = catchAsync(async (req: Request, res: Response) => {
  const { lockerId } = req.params;
  const result = await GuestServices.deleteGuestLocker(lockerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result,
    data: null,
  });
});

const runCleanup = catchAsync(async (_req: Request, res: Response) => {
  const result = await GuestServices.cleanupExpiredGuestData();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Expired guest data cleanup executed.",
    data: result,
  });
});

export const GuestControllers = {
  getGuestLocker,
  saveGuestText,
  uploadGuestFile,
  deleteGuestFile,
  deleteGuestLocker,
  runCleanup,
};
