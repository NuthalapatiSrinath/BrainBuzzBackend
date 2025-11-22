import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    score: { type: Number, required: true },
    totalQuestions: { type: Number },
    correctAnswers: { type: Number },
    wrongAnswers: { type: Number },

    timeTakenSeconds: { type: Number, required: true }, // Crucial for ranking tie-breaker

    userResponses: [
      {
        questionIndex: Number,
        selectedOption: Number,
      },
    ],

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quiz_results" }
);

// Index for fast ranking calculations
quizResultSchema.index({ quizId: 1, score: -1, timeTakenSeconds: 1 });

export default mongoose.model("QuizResult", quizResultSchema);
