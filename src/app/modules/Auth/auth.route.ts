import express from "express";
import { AuthControllers } from "./auth.controller";

const router = express.Router();

router.post("/send-email", AuthControllers.sendMail);

export const AuthRoutes = router;
