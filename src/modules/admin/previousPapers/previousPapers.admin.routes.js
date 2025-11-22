import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";
import * as ctrl from "./previousPapers.admin.controller.js";

const router = express.Router();

// Apply Security
router.use(authenticate, ensureAdmin);

// --- Categories ---
router.post("/category", ctrl.createPaperCategory);
router.put("/category/:id", ctrl.updatePaperCategory);
router.delete("/category/:id", ctrl.deletePaperCategory);

// --- Subcategories ---
// Now creates UNDER a specific category
router.post("/:categoryKey/subcategory", ctrl.createPaperSubcategory);
router.put("/subcategory/:id", ctrl.updatePaperSubcategory);
router.delete("/subcategory/:id", ctrl.deletePaperSubcategory);

// --- Papers (Content) ---
// Now creates UNDER a specific category & subcategory
router.post("/:categoryKey/:subId/paper", ctrl.createPaper);
router.put("/paper/:id", ctrl.updatePaper);
router.delete("/paper/:id", ctrl.deletePaper);

export default router;
