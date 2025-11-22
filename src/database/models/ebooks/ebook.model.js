import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema(
  {
    // 1. UNIQUE TITLE (Primary Key logic)
    title: { type: String, required: true, unique: true },

    categoryKey: { type: String, index: true, required: true },
    subcategoryId: { type: String, index: true, required: true },

    thumbnail: { type: String },
    pdfUrl: { type: String, required: true },
    description: { type: String },

    // 2. MULTIPLE LANGUAGES (Array of Strings)
    // Example: ["English", "Telugu"]
    language: {
      type: [String],
      default: ["English"],
      index: true,
    },

    validity: { type: String, default: "NA" },

    isPaid: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "ebooks" }
);

export default mongoose.model("Ebook", ebookSchema);
