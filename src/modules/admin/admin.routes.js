import express from "express";
import { authenticate } from "../../middleware/auth.js";
import ensureAdmin from "../../middleware/ensureAdmin.js";

// Import Sub-Routers
import currentAffairsRoutes from "./currentAffairs/currentAffairs.admin.routes.js";
import previousPapersRoutes from "./previousPapers/previousPapers.admin.routes.js";
import quizAdminRoutes from "./quiz/quiz.admin.routes.js";
import ebookAdminRoutes from "./ebooks/ebooks.admin.routes.js";
import pageAdminRoutes from "./pages/pages.admin.routes.js";

// Import Common Controller (Media/Subscriptions)
import * as commonCtrl from "./admin.controller.js";

const router = express.Router();

// Global Security: All admin routes require Auth + Admin Role
router.use(authenticate, ensureAdmin);

// 1. Mount Sub-Modules
router.use("/current-affairs", currentAffairsRoutes);
router.use("/previous-papers", previousPapersRoutes);
router.use("/ebooks", ebookAdminRoutes);
router.use("/quiz", quizAdminRoutes);
router.use("/pages", pageAdminRoutes);

// 2. Common Routes (Media & Subscriptions)
router.post("/media", commonCtrl.createMedia);
router.get("/media", commonCtrl.listMedia);
router.delete("/media/:id", commonCtrl.deleteMedia);

router.get("/subscriptions", commonCtrl.listSubscriptions);

export default router;
