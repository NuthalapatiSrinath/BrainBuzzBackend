import express from "express";
import {
  getPaperCategories,
  getPaperSubcategories,
  getPapersList,
  getPaperDetail,
} from "./previousPapers.controller.js";

const router = express.Router();

// Page 1: Categories
router.get("/papercategories", getPaperCategories);

// Page 2: Subcategories for a specific category
router.get("/:categoryKey/subcategories", getPaperSubcategories);

// Page 3: List of papers
router.get("/:categoryKey/:subId/list", getPapersList);

// Page 4: Paper Detail (For previewing PDF)
router.get("/paper/:paperId", getPaperDetail);

export default router;
