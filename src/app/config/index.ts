import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  default_password: process.env.DEFAULT_PASS,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  clerk_secret_key: process.env.CLERK_SECRET_KEY,
  clerk_publishable_key: process.env.CLERK_PUBLISHABLE_KEY,
  email_user: process.env.EMAIL_USER || "zlocker2025@gmail.com",
  email_pass: process.env.EMAIL_PASS,
  secret_key: process.env.SECRET_KEY || "default_insecure_secret_key_32_bytes_len!",
  allowed_origins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["*"],
};
