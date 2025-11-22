import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";
import * as ctrl from "./ebooks.admin.controller.js";

const router = express.Router();

router.use(authenticate, ensureAdmin);

// Category
router.post("/category", ctrl.createCategory);
router.put("/category/:id", ctrl.updateCategory);
router.delete("/category/:id", ctrl.deleteCategory);

// Subcategory
router.post("/:categoryKey/subcategory", ctrl.createSubcategory);
router.put("/subcategory/:id", ctrl.updateSubcategory);
router.delete("/subcategory/:id", ctrl.deleteSubcategory);

// E-Books (Hierarchical)
router.post("/:categoryKey/:subId/create", ctrl.createEbook);
router.put("/:id", ctrl.updateEbook);
router.delete("/:id", ctrl.deleteEbook);

export default router;
