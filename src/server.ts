import { Server } from "http";
import app, { connectDB } from "./app";
import config from "./app/config";

let server: Server;

async function main() {
  try {
    await connectDB();

    const port = Number(config.port) || 5000;
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`app is listening on port ${port}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
  }
}

// Only start standalone HTTP server when not running in Vercel serverless environment
if (!process.env.VERCEL) {
  main();
}

process.on("unhandledRejection", (err) => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});

export default app;
