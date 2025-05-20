import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // TTL: expires after 120 seconds (2 mins)
  },
});

export const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema
);
