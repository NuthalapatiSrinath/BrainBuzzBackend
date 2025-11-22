import mongoose from "mongoose";

const ebookCategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "upsc"
    title: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "ebook_categories" }
);

export default mongoose.model("EbookCategory", ebookCategorySchema);
