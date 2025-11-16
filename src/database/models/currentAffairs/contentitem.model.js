import mongoose from "mongoose";

const contentItemSchema = new mongoose.Schema(
  {
    _id: { type: String }, // we seeded valid 24-hex ids
    title: { type: String, required: true },
    excerpt: { type: String },
    body: { type: String }, // html or text
    date: { type: Date, index: true },
    month: { type: String, index: true }, // YYYY-MM used for monthly filter
    scope: { type: String }, // e.g. International, State News, Banking...
    image: { type: String },
    contentUrl: { type: String }, // optional pdf URL
    categoryKey: { type: String, index: true }, // e.g. "upsc"
    subcategoryId: { type: String, index: true }, // e.g. "upsc_ias"
    isPaid: { type: Boolean, default: false },
    language: { type: String, default: "en", index: true }, // "en"/"hi"/"te"
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    author: { type: String },
  },
  { collection: "contentitems" }
);

export default mongoose.model("ContentItem", contentItemSchema);
