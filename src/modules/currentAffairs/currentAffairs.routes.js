import express from "express";
import {
  getCategories,
  getAllCategoriesWithSubs,
  getCategoryLanding,
  getArticlesList,
  getArticleDetail,
} from "./currentAffairs.controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/all", getAllCategoriesWithSubs); // NEW: returns categories + subcategories
router.get("/:categoryKey", getCategoryLanding);
router.get("/:categoryKey/:subId/articles", getArticlesList);
router.get("/:categoryKey/:subId/:articleId", getArticleDetail);

export default router;
