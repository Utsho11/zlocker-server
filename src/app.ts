import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorhandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.0.118:3000"],
    credentials: true,
  })
);

// application routes
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hi Developer ! You are welcome to the server.");
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
