import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }], // ["Option A", "Option B", "Option C", "Option D"]
  correctOptionIndex: { type: Number, required: true }, // 0, 1, 2, or 3
  explanation: { type: String }, // Shown in solution view
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // "IAS GS Foundation - Quiz 1"

    // --- Hierarchy ---
    categoryKey: { type: String, index: true, required: true },
    subcategoryId: { type: String, index: true, required: true },

    // --- Filter Fields ---
    month: { type: String, index: true }, // "2025-10"
    date: { type: Date, default: Date.now },

    // --- Description Page Content (Image 2) ---
    description: { type: String }, // The main text block
    participationInfo: { type: String }, // "Why Participate..." text block

    // --- Config ---
    durationMinutes: { type: Number, default: 10 },
    totalMarks: { type: Number, default: 10 },
    questions: [questionSchema],

    isPaid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quizzes" }
);

export default mongoose.model("Quiz", quizSchema);
