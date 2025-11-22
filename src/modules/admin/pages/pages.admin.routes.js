import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";

// FIX: Go up TWO levels to find controllers
import * as ctrl from "./pages.admin.controller.js";

const router = express.Router();

router.use(authenticate, ensureAdmin);

// Create or Update Page
router.post("/", ctrl.updatePage);

// Get Page Data (for Admin to view)
router.get("/:slug", ctrl.getPageBySlug);

export default router;
