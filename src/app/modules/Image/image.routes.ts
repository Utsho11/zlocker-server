import express from "express";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../config/multer.config";
import { USER_ROLE } from "../User/user.constant";
import { ImageControllers } from "./image.controllers";
const router = express.Router();

router.post(
  "/add-image",
  auth(USER_ROLE.user, USER_ROLE.premiumUser, USER_ROLE.superAdmin),
  fileUploader.single("file"),
  ImageControllers.stroreImage
);

router.delete(
  "/delete-image/:id",
  auth(USER_ROLE.user, USER_ROLE.premiumUser, USER_ROLE.superAdmin),
  ImageControllers.deleteImage
);

router.get(
  "/get-all-image",
  auth(USER_ROLE.user, USER_ROLE.premiumUser, USER_ROLE.superAdmin),
  ImageControllers.getAllImage
);

export const ImageRoutes = router;
