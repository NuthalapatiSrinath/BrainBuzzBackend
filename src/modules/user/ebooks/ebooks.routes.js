import express from "express";
import * as ctrl from "./ebooks.controller.js";

const router = express.Router();

// Directory (View All)
router.get("/all", ctrl.getAllEbookCategoriesWithSubs);

// Navigation
router.get("/categories", ctrl.getEbookCategories);
router.get("/:categoryKey/subcategories", ctrl.getEbookSubcategories);
router.get("/:categoryKey/:subId/list", ctrl.getEbooksList);

// Details
router.get("/:ebookId/detail", ctrl.getEbookDetail);
router.put("/:ebookId/track", ctrl.trackEbookDownload);

export default router;
