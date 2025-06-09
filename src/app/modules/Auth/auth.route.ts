import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../User/user.constant";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser
);

router.put(
  "/change-password",
  auth(USER_ROLE.superAdmin, USER_ROLE.user),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.put(
  "/add-username",
  auth(USER_ROLE.superAdmin, USER_ROLE.user),
  AuthControllers.addUsername
);

router.post("/verify-code", AuthControllers.verifyCode);

router.post(
  "/resend-email-varification-code",
  validateRequest(AuthValidation.emailValidationSchema),
  AuthControllers.resendVerificationCode
);

router.post(
  "/forget-password",
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

router.get(
  "/getMe",
  auth(USER_ROLE.superAdmin, USER_ROLE.user, USER_ROLE.premiumUser),
  AuthControllers.getMe
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.resetPassword
);

export const AuthRoutes = router;
