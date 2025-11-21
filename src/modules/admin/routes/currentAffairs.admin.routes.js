import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";
import * as ctrl from "../controllers/currentAffairs.admin.controller.js";

const router = express.Router();

// Apply Security
router.use(authenticate, ensureAdmin);

// --- Categories ---
router.post("/category", ctrl.createCategory);
router.put("/category/:id", ctrl.updateCategory);
router.delete("/category/:id", ctrl.deleteCategory);

// --- Subcategories ---
// Now uses Hierarchical URL: admin/current-affairs/:categoryKey/subcategory
router.post("/:categoryKey/subcategory", ctrl.createSubcategory);
router.put("/subcategory/:id", ctrl.updateSubcategory);
router.delete("/subcategory/:id", ctrl.deleteSubcategory);

// --- Content (Articles) ---
// Now uses Hierarchical URL: admin/current-affairs/:categoryKey/:subId/content
router.post("/:categoryKey/:subId/content", ctrl.createContent);
router.put("/content/:id", ctrl.updateContent);
router.delete("/content/:id", ctrl.deleteContent);

export default router;
