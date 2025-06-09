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

export const TextRoutes = router;
