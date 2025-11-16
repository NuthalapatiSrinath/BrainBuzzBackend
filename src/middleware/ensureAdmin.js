// src/middleware/ensureAdmin.js
export default function ensureAdmin(req, res, next) {
  // authenticate middleware must run before this and set req.user
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden - admin only" });
  }
  return next();
}
