import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { createUserValidationSchema } from "./user.validation";

const router = express.Router();

router.post(
  "/register-user",
  validateRequest(createUserValidationSchema),
  UserControllers.createUser
);

export const UserRoutes = router;
