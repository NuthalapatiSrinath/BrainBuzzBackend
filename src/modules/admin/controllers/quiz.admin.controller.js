import express from "express";
import ensureAdmin from "../../../middleware/ensureAdmin.js";
import { authenticate } from "../../../middleware/auth.js";
import * as ctrl from "../controllers/quiz.admin.controller.js";

const router = express.Router();

router.use(authenticate, ensureAdmin);

// Category
router.post("/category", ctrl.createQuizCategory);
router.put("/category/:id", ctrl.updateQuizCategory);
router.delete("/category/:id", ctrl.deleteQuizCategory);

// Subcategory
router.post("/:categoryKey/subcategory", ctrl.createQuizSubcategory);
router.put("/subcategory/:id", ctrl.updateQuizSubcategory);
router.delete("/subcategory/:id", ctrl.deleteQuizSubcategory);

// Quiz
router.post("/:categoryKey/:subId/create", ctrl.createQuiz);
router.put("/:id", ctrl.updateQuiz);
router.delete("/:id", ctrl.deleteQuiz);

export default router;
