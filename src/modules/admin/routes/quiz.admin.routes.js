import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";
import * as ctrl from "../controllers/quiz.admin.controller.js";

const router = express.Router();

router.use(authenticate, ensureAdmin);

// Categories
router.post("/category", ctrl.createQuizCategory);

// Subcategories
router.post("/:categoryKey/subcategory", ctrl.createQuizSubcategory);

// Create Quiz (Hierarchical)
router.post("/:categoryKey/:subId/create", ctrl.createQuiz);

export default router;
