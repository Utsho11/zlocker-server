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
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.put(
  "/add-username",
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  AuthControllers.addUsername
);

router.put(
  "/add-email",
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  AuthControllers.addEmail
);

router.put(
  "/verify-code",
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  AuthControllers.verifyCode
);

router.post(
  "/request/email-varification",
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  validateRequest(AuthValidation.emailValidationSchema),
  AuthControllers.requestEmailVarification
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

router.post(
  "/getMe",
  auth(USER_ROLE.superAdmin, USER_ROLE.basic),
  AuthControllers.getMe
);

// router.post(
//   "/reset-password",
//   validateRequest(AuthValidation.forgetPasswordValidationSchema),
//   AuthControllers.resetPassword
// );

export const AuthRoutes = router;
