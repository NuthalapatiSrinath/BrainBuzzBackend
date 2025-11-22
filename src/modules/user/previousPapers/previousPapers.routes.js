import express from "express";
import {
  getPaperCategories,
  getPaperSubcategories,
  getPapersList,
  trackDownload, // <-- Updated import
  getRecentPapers,
  getPaperArchives,
} from "./previousPapers.controller.js";

const router = express.Router();

// --- GLOBAL WIDGETS ---
router.get("/recent", getRecentPapers);
router.get("/archives", getPaperArchives);

// --- PAGE ROUTES ---

// Page 1: Categories
router.get("/papercategories", getPaperCategories);

// Page 2: Subcategories
router.get("/:categoryKey/subcategories", getPaperSubcategories);

// Page 3: List of papers
router.get("/:categoryKey/:subId/list", getPapersList);

// OPTIONAL: Track Download (Call this when PDF is clicked)
// Using PUT because we are updating the resource (incrementing count)
router.put("/paper/:paperId/track", trackDownload);

export default router;
