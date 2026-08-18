import { Router } from "express";
import { fileUploader } from "../../config/multer.config";
import { GuestControllers } from "./guest.controllers";

const router = Router();

// Automatic cleanup endpoint
router.get("/cleanup", GuestControllers.runCleanup);

// Specific Locker routes
router.get("/:lockerId", GuestControllers.getGuestLocker);
router.post("/:lockerId/text", GuestControllers.saveGuestText);
router.post(
  "/:lockerId/file",
  fileUploader.single("file"),
  GuestControllers.uploadGuestFile
);
router.delete("/:lockerId/file/:fileId", GuestControllers.deleteGuestFile);
router.delete("/:lockerId", GuestControllers.deleteGuestLocker);

export const GuestRoutes = router;
