import mongoose from "mongoose";

const quizSubcategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "upsc_static_polity"
    categoryKey: {
      type: String,
      required: true,
      index: true,
      ref: "QuizCategory",
    },
    title: { type: String, required: true }, // e.g. "Polity"
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "quiz_subcategories" }
);

export default mongoose.model("QuizSubcategory", quizSubcategorySchema);
