import mongoose from "mongoose";

const paperSubcategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "upsc_prelims_2024"
    categoryKey: {
      type: String,
      required: true,
      index: true,
      ref: "PaperCategory",
    },
    title: { type: String, required: true }, // e.g. "UPSC Prelims 2024"
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "paper_subcategories" }
);

export default mongoose.model("PaperSubcategory", paperSubcategorySchema);
