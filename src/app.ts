import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";
import { clerkMiddleware } from "@clerk/express";
import config from "./app/config";

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        config.allowed_origins.includes(origin) ||
        config.allowed_origins.includes("*")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in dev/preview
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());

// application routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hi Developers ! You are welcome to the server.");
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
