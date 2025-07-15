import express from "express";
import { fileUploader } from "../../config/multer.config";
import { ImageControllers } from "./image.controllers";
// import { clerkClient } from "../../middlewares/clerkClient";
import { requireAuth } from "@clerk/express";
const router = express.Router();

router.post(
  "/add-image",
  requireAuth(),
  fileUploader.single("file"),
  ImageControllers.stroreImage
);

router.delete("/delete-image/:id", requireAuth(), ImageControllers.deleteImage);

router.get("/get-all-image", requireAuth(), ImageControllers.getAllImage);

export const ImageRoutes = router;
