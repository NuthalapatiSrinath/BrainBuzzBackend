import Quiz from "../../../database/models/quiz/quiz.model.js";
import QuizSubcategory from "../../../database/models/quiz/quizSubcategory.model.js";
import QuizCategory from "../../../database/models/quiz/quizCategory.model.js";
import logger from "../../../utils/logger.js";

// ... [Keep Categories/Subcategories Create/Update/Delete Logic as is] ...
export const createQuizCategory = async (req, res) => {
  try {
    const { _id, title, logo, description } = req.body;
    const doc = await QuizCategory.create({ _id, title, logo, description });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const updateQuizCategory = async (req, res) => {
  try {
    const doc = await QuizCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
export const deleteQuizCategory = async (req, res) => {
  try {
    const doc = await QuizCategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
export const createQuizSubcategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const { _id, title, logo, description } = req.body;
    const catExists = await QuizCategory.exists({ _id: categoryKey });
    if (!catExists)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    const doc = await QuizSubcategory.create({
      _id,
      categoryKey,
      title,
      logo,
      description,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const updateQuizSubcategory = async (req, res) => {
  try {
    const doc = await QuizSubcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
export const deleteQuizSubcategory = async (req, res) => {
  try {
    const doc = await QuizSubcategory.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

/* --- QUIZZES (Updated Logic) --- */
export const createQuiz = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;
    const payload = req.body;

    // 1. Validate Subcategory
    const subExists = await QuizSubcategory.exists({ _id: subId, categoryKey });
    if (!subExists)
      return res
        .status(404)
        .json({ success: false, message: "Invalid Category/Subcategory" });

    // 2. Logic: Calculate Total Marks
    // If user entered "No.of.Ques" (totalQuestionsCount) but sent different array length,
    // we trust the array length for scoring, but save the user's input for display.
    const marksPerQ = payload.marksPerQuestion || 1;
    const actualQuestionCount = payload.questions
      ? payload.questions.length
      : 0;
    const totalMarks = actualQuestionCount * marksPerQ;

    // 3. Create Quiz
    const doc = await Quiz.create({
      ...payload,
      categoryKey,
      subcategoryId: subId,

      // UI Specific mappings
      month: payload.month, // "January"
      date: payload.date ? new Date(payload.date) : new Date(), // "2025-02-14"
      totalQuestionsCount: payload.totalQuestionsCount, // "No.of.ques" input

      marksPerQuestion: marksPerQ,
      totalMarks: totalMarks, // Auto-calculated
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const doc = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const doc = await Quiz.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
