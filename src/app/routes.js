// src/app/routes.js
import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import currentAffairsRoutes from "../modules/currentAffairs/currentAffairs.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";

const router = express.Router();

// health check
router.get("/health", (req, res) => res.json({ ok: true }));

// Auth (register/login)
router.use("/auth", authRoutes);

// Current affairs public API
router.use("/currentaffairs", currentAffairsRoutes);

// Admin (protected inside adminRoutes using your authenticate + ensureAdmin)
router.use("/admin", adminRoutes);

export default router;
