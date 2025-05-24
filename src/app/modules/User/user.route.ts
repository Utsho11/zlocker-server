import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
  "/register-user",
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.createTempUser
);

export const UserRoutes = router;
