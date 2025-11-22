import QuizCategory from "../../../database/models/quiz/quizCategory.model.js";
import QuizSubcategory from "../../../database/models/quiz/quizSubcategory.model.js";
import Quiz from "../../../database/models/quiz/quiz.model.js";
import QuizResult from "../../../database/models/quiz/quizResult.model.js";
import logger from "../../../utils/logger.js";

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
    const { month, lang } = req.query;

    const filter = { categoryKey, subcategoryId: subId };

    if (month) filter.month = month;
    if (lang) filter.language = lang;

    const quizzes = await Quiz.find(filter)
      .select("-questions -description -participationInfo")
      .sort({ date: -1 })
      .lean();

    return res.json({ success: true, data: quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. Start Quiz (Public)
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz)
      return res.status(404).json({ success: false, message: "Not found" });

    const sanitized = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText, // Returns HTML string with styles
      options: q.options,
    }));

    return res.json({ success: true, data: { ...quiz, questions: sanitized } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- 5. Submit Quiz (Updated Scoring) ---
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTakenSeconds } = req.body;
    const userId = req.user ? req.user.sub : null;

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ success: false });

    // SCORING LOGIC
    const pointsPerQ = quiz.marksPerQuestion || 1;
    const maxPossibleScore = quiz.questions.length * pointsPerQ;

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;

    answers.forEach((ans) => {
      const q = quiz.questions[ans.questionIndex];
      if (q && q.correctOptionIndex === ans.selectedOption) {
        score += pointsPerQ; // Add weighted marks
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const percentage =
      maxPossibleScore > 0 ? ((score / maxPossibleScore) * 100).toFixed(0) : 0;

    const responseData = {
      score,
      maxScore: maxPossibleScore,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      percentage,
      rank: null,
      totalParticipants: 0,
      isGuest: !userId,
    };

    // If User: Save & Rank
    if (userId) {
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

      // Rank Calculation
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

// 6. Solutions
export const getQuizSolutions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();
    return res.json({ success: true, data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// 7. Get Directory
export const getAllQuizCategoriesWithSubs = async (req, res) => {
  try {
    const cats = await QuizCategory.find({}).sort({ title: 1 }).lean();
    const subs = await QuizSubcategory.find({}).sort({ title: 1 }).lean();

    const byCategory = subs.reduce((acc, s) => {
      (acc[s.categoryKey] = acc[s.categoryKey] || []).push(s);
      return acc;
    }, {});

    const result = (cats || []).map((c) => ({
      ...c,
      subcategories: (byCategory[c._id] || []).map((s) => ({
        id: s._id,
        title: s.title,
        logo: s.logo,
        description: s.description,
      })),
    }));

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
