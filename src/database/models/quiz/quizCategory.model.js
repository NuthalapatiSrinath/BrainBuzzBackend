import mongoose from "mongoose";

const quizCategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "daily_quiz"
    title: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quiz_categories" }
);

export default mongoose.model("QuizCategory", quizCategorySchema);
