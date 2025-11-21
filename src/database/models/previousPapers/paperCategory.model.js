import mongoose from "mongoose";

const paperCategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "previous_upsc"
    title: { type: String, required: true },
    logo: { type: String }, // Icon for the category
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "paper_categories" }
);

export default mongoose.model("PaperCategory", paperCategorySchema);
