// src/app/routes.js
import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import currentAffairsRoutes from "../modules/currentAffairs/currentAffairs.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
// Import the new module
import previousPapersRoutes from "../modules/previousPapers/previousPapers.routes.js";

const router = express.Router();

// health check
router.get("/health", (req, res) => res.json({ ok: true }));

// Auth
router.use("/auth", authRoutes);

// Current affairs
router.use("/currentaffairs", currentAffairsRoutes);

// Previous Question Papers (NEW)
router.use("/previouspapers", previousPapersRoutes);

// Admin
router.use("/admin", adminRoutes);

export default router;
