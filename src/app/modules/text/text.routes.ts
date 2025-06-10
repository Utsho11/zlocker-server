import express from "express";
import { TextControllers } from "./text.controllers";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.constant";

const router = express.Router();

router.post(
  "/create-content",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.premiumUser),
  TextControllers.createContent
);

router.get(
  "/get-all-content",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.premiumUser),
  TextControllers.getAllContent
);

router.get(
  "/get-content/:id",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.premiumUser),
  TextControllers.getSingleContent
);

router.put(
  "/update-content/:id",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.premiumUser),
  TextControllers.updateContent
);

router.delete(
  "/delete-content/:id",
  auth(USER_ROLE.user, USER_ROLE.superAdmin, USER_ROLE.premiumUser),
  TextControllers.deleteContent
);

export const TextRoutes = router;
