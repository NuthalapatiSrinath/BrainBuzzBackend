import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    // The unique ID (e.g. "about-us")
    slug: { type: String, required: true },

    // Language support (Default English)
    language: { type: String, default: "en" },

    title: { type: String, required: true },
    content: { type: String }, // Rich Text HTML
    images: [{ type: String }], // Array of image URLs

    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "pages" }
);

// Ensure unique combo of slug + language
// (So you can have one "about-us" in 'en' and one in 'te')
pageSchema.index({ slug: 1, language: 1 }, { unique: true });

export default mongoose.model("Page", pageSchema);
