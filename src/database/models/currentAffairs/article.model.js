import mongoose from "mongoose";

// This model is for LISTING (Home page, Category page, Sidebar)
// It does NOT contain the heavy 'body' text.
const articleSchema = new mongoose.Schema(
  {
    _id: { type: String }, // We keep your existing ID logic
    title: { type: String, required: true },
    excerpt: { type: String }, // Short summary for cards

    date: { type: Date, index: true },
    month: { type: String, index: true }, // YYYY-MM
    scope: { type: String }, // International, Sports, etc.

    image: { type: String }, // Thumbnail/Cover image

    categoryKey: { type: String, index: true }, // e.g. "upsc"
    subcategoryId: { type: String, index: true }, // e.g. "upsc_ias"

    language: { type: String, default: "en", index: true }, // "en"/"hi"/"te"
    author: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "articles" }
);

export default mongoose.model("Article", articleSchema);
