// src/app/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

// IMPORT THE LOGGER
import logger from "../utils/logger.js"; //

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());

// ----------------------------------------------------------
// LOGGING CONFIGURATION
// ----------------------------------------------------------

// 1. Use Morgan for HTTP logs, but pipe the stream to Winston
// This ensures all network traffic is saved in 'logs/combined.log'
app.use(morgan("combined", { stream: logger.stream }));

// ----------------------------------------------------------

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use("/api", routes);

// 404 Handler
app.use((req, res, next) => {
  // Optional: Log 404s if you want to track broken links
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: "Not Found" });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  // 2. Replace console.error with logger.error
  // This saves the crash details and stack trace to 'logs/error.log'
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  // If you want the full stack trace in the file:
  logger.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
