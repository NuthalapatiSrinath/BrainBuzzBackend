import express from "express";
import { authenticate } from "../../middleware/auth.js";
import ensureAdmin from "../../middleware/ensureAdmin.js";

// Import Sub-Routers
import currentAffairsRoutes from "./routes/currentAffairs.admin.routes.js";
import previousPapersRoutes from "./routes/previousPapers.admin.routes.js";

// Import Common Controller (Media/Subscriptions)
import * as commonCtrl from "./admin.controller.js";

const router = express.Router();

// Global Security: All admin routes require Auth + Admin Role
router.use(authenticate, ensureAdmin);

// 1. Mount Sub-Modules
router.use("/current-affairs", currentAffairsRoutes);
router.use("/previous-papers", previousPapersRoutes);

// 2. Common Routes (Media & Subscriptions)
router.post("/media", commonCtrl.createMedia);
router.get("/media", commonCtrl.listMedia);
router.delete("/media/:id", commonCtrl.deleteMedia);

router.get("/subscriptions", commonCtrl.listSubscriptions);

export default router;
