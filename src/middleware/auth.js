import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// --- NEW MIDDLEWARE ---
export const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If no token, just proceed as "Guest" (req.user will be undefined)
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.user = payload; // User is authenticated
  } catch (err) {
    // If token is invalid, we ignore it and treat as Guest
    console.warn("Optional Auth: Invalid token provided, proceeding as guest.");
  }

  return next();
};
