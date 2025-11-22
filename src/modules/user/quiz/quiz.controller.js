import QuizCategory from "../../../database/models/quiz/quizCategory.model.js";
import QuizSubcategory from "../../../database/models/quiz/quizSubcategory.model.js";
import Quiz from "../../../database/models/quiz/quiz.model.js";
import QuizResult from "../../../database/models/quiz/quizResult.model.js";
import logger from "../../../utils/logger.js";

// ... [Keep getQuizCategories, getQuizSubcategories, getQuizzesList, getQuizMeta, startQuiz AS IS] ...

// 1. Get Categories
export const getQuizCategories = async (req, res) => {
  try {
    const cats = await QuizCategory.find({}).sort({ title: 1 }).lean();
    return res.json({ success: true, data: cats });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2. Get Subcategories
export const getQuizSubcategories = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const subs = await QuizSubcategory.find({ categoryKey })
      .sort({ title: 1 })
      .lean();
    return res.json({ success: true, data: subs });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. List Quizzes
export const getQuizzesList = async (req, res) => {
  try {
    const { categoryKey, subId } = req.params;
    const { month } = req.query;

    const filter = { categoryKey, subcategoryId: subId };
    if (month) filter.month = month;

    const quizzes = await Quiz.find(filter)
      .select("-questions -description -participationInfo")
      .sort({ date: -1 })
      .lean();

    return res.json({ success: true, data: quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Get Quiz Info
export const getQuizMeta = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId)
      .select(
        "title description participationInfo durationMinutes totalMarks questions.length"
      )
      .lean();

    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    const meta = { ...quiz, totalQuestions: quiz.questions.length };
    delete meta.questions;

    return res.json({ success: true, data: meta });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 5. Start Quiz
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz)
      return res.status(404).json({ success: false, message: "Not found" });

    const sanitized = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    return res.json({ success: true, data: { ...quiz, questions: sanitized } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- UPDATED SUBMIT LOGIC ---
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTakenSeconds } = req.body;
    // Check if user exists (from optionalAuthenticate)
    const userId = req.user ? req.user.sub : null;

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ success: false });

    // 1. Calculate Score
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    answers.forEach((ans) => {
      const q = quiz.questions[ans.questionIndex];
      if (q && q.correctOptionIndex === ans.selectedOption) {
        score++;
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage = ((score / quiz.questions.length) * 100).toFixed(0);

    // 2. Prepare Base Data (Common for Guest & User)
    const responseData = {
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      percentage,
      rank: null, // Default null
      totalParticipants: 0,
      isGuest: !userId,
    };

    // 3. If Authenticated: Save & Rank
    if (userId) {
      // Save Result
      await QuizResult.create({
        userId,
        quizId,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        timeTakenSeconds,
        userResponses: answers,
      });

      // Calculate Rank
      const betterScoreCount = await QuizResult.countDocuments({
        quizId,
        score: { $gt: score },
      });

      const sameScoreBetterTime = await QuizResult.countDocuments({
        quizId,
        score: score,
        timeTakenSeconds: { $lt: timeTakenSeconds },
      });

      responseData.rank = betterScoreCount + sameScoreBetterTime + 1;
      responseData.totalParticipants = await QuizResult.countDocuments({
        quizId,
      });
    } else {
      // If Guest: Just get participant count for context (optional)
      responseData.totalParticipants = await QuizResult.countDocuments({
        quizId,
      });
    }

    return res.json({ success: true, data: responseData });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7. Get Solutions
export const getQuizSolutions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();
    return res.json({ success: true, data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
