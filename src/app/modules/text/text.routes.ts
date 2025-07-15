import express from "express";
import { TextControllers } from "./text.controllers";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/create-content", requireAuth(), TextControllers.createContent);

router.get("/get-all-content", requireAuth(), TextControllers.getAllContent);

router.get("/get-content/:id", requireAuth(), TextControllers.getSingleContent);

router.put("/update-content/:id", requireAuth(), TextControllers.updateContent);

router.delete(
  "/delete-content/:id",
  requireAuth(),
  TextControllers.deleteContent
);

export const TextRoutes = router;
