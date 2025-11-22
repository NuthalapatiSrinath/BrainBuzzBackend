import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    // FIX: Add a default generator so Mongoose creates an ID automatically
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },

    title: { type: String, required: true },
    excerpt: { type: String },

    date: { type: Date, index: true },
    month: { type: String, index: true },
    scope: { type: String },

    image: { type: String },

    categoryKey: { type: String, index: true },
    subcategoryId: { type: String, index: true },

    language: { type: String, default: "en", index: true },
    author: { type: String },

    // Note: 'isPaid' was missing in your previous schema. Added it here if you need it.
    isPaid: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "articles" }
);

export default mongoose.model("Article", articleSchema);
