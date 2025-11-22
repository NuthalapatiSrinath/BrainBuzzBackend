// src/app/routes.js
import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import currentAffairsRoutes from "../modules/user/currentAffairs/currentAffairs.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
// Import the new module
import previousPapersRoutes from "../modules/user/previousPapers/previousPapers.routes.js";
import quizRoutes from "../modules/user/quiz/quiz.routes.js";
import ebookRoutes from "../modules/user/ebooks/ebooks.routes.js";
import pageRoutes from "../modules/user/pages/pages.routes.js";
const router = express.Router();

// health check
router.get("/health", (req, res) => res.json({ ok: true }));

// Auth
router.use("/auth", authRoutes);

// Current affairs
router.use("/currentaffairs", currentAffairsRoutes);

// Previous Question Papers (NEW)
router.use("/previouspapers", previousPapersRoutes);

router.use("/quiz", quizRoutes);
router.use("/ebooks", ebookRoutes);
router.use("/pages", pageRoutes);
// Admin
router.use("/admin", adminRoutes);

export default router;
