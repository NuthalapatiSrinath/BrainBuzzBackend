import mongoose from "mongoose";

const ebookSubcategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "upsc_foundation"
    categoryKey: {
      type: String,
      required: true,
      index: true,
      ref: "EbookCategory",
    },
    title: { type: String, required: true }, // e.g. "Foundation"
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "ebook_subcategories" }
);

export default mongoose.model("EbookSubcategory", ebookSubcategorySchema);
