// src/utils/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve paths (needed for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define log directory (project_root/logs)
const logDir = path.join(__dirname, "../../logs");

// 2. Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 3. Create the Winston Logger
const logger = winston.createLogger({
  level: "info", // Log everything 'info' and above
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json() // Save as JSON in files for easy parsing later
  ),
  defaultMeta: { service: "brainbuzz-backend" },
  transports: [
    // - Write all logs with level 'error' to `error.log`
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    // - Write all logs to `combined.log`
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// 4. If not in production, also log to the console (colored & simple)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// 5. Create a stream object for Morgan (to pipe HTTP requests into Winston)
logger.stream = {
  write: function (message) {
    // Morgan adds a newline, so we trim it
    logger.info(message.trim());
  },
};

export default logger;
