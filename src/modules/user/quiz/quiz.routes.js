import express from "express";
import {
  authenticate,
  optionalAuthenticate,
} from "../../../middleware/auth.js"; // <-- Import both
import * as ctrl from "./quiz.controller.js";

const router = express.Router();

// Public / List
router.get("/categories", ctrl.getQuizCategories);
router.get("/:categoryKey/subcategories", ctrl.getQuizSubcategories);
router.get("/:categoryKey/:subId/list", ctrl.getQuizzesList);
router.get("/:quizId/info", ctrl.getQuizMeta);

// Quiz Flow
router.get("/:quizId/start", authenticate, ctrl.startQuiz); // Start usually requires login to track start time, but can be optional too if you want. Keeping strict for now.

// --- CHANGED TO OPTIONAL AUTH ---
router.post("/:quizId/submit", optionalAuthenticate, ctrl.submitQuiz);

router.get("/:quizId/solutions", authenticate, ctrl.getQuizSolutions);

export default router;
