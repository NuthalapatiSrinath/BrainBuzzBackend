import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  // UI Field: "01" (Question Number)
  questionNumber: { type: String, required: true },

  // UI Field: "Type and Edit here" (Rich Text HTML)
  questionText: { type: String, required: true },

  // UI Field: "Option 1", "Option 2"...
  options: [{ type: String }],

  // UI Field: "Answer" (Dropdown index)
  correctOptionIndex: { type: Number, required: true },

  // UI Field: "Explanation" (Rich Text)
  explanation: { type: String },
});

const quizSchema = new mongoose.Schema(
  {
    // UI Field: "Quiz Name"
    title: { type: String, required: true },

    // Hierarchy (From previous page selection)
    categoryKey: { type: String, index: true, required: true },
    subcategoryId: { type: String, index: true, required: true },

    // UI Field: "Select Month" (e.g., "January", "February")
    month: { type: String, index: true },

    // UI Field: "Languages" (e.g., "English")
    language: { type: String, default: "English", index: true },

    // UI Field: "Set Date" (e.g., "14-02-2025")
    date: { type: Date, default: Date.now },

    // UI Field: "No.of.ques" (The number user typed)
    totalQuestionsCount: { type: Number },

    // UI Field: "Add Instructions" (Rich Text HTML)
    description: { type: String },

    // (Optional based on prev images, keep if needed)
    participationInfo: { type: String },

    // --- Scoring & Config ---
    durationMinutes: { type: Number, default: 10 },

    // UI Field: "Enter Marks" (per question)
    marksPerQuestion: { type: Number, default: 1 },

    // Calculated automatically
    totalMarks: { type: Number, default: 0 },

    // UI Field: "Add Question Paper" -> Questions List
    questions: [questionSchema],

    isPaid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quizzes" }
);

export default mongoose.model("Quiz", quizSchema);
