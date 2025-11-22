import express from "express";
import { optionalAuthenticate } from "../../../middleware/auth.js";
import * as ctrl from "./quiz.controller.js";

const router = express.Router();

// --- NEW ROUTE: View All Quizzes (Nested Structure) ---
router.get("/all", ctrl.getAllQuizCategoriesWithSubs);

// Navigation
router.get("/categories", ctrl.getQuizCategories);
router.get("/:categoryKey/subcategories", ctrl.getQuizSubcategories);
router.get("/:categoryKey/:subId/list", ctrl.getQuizzesList);

// Quiz Flow
router.get("/:quizId/start", ctrl.startQuiz);
router.post("/:quizId/submit", optionalAuthenticate, ctrl.submitQuiz);
router.get("/:quizId/solutions", ctrl.getQuizSolutions);

export default router;
