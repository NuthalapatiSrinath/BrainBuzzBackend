import mongoose from "mongoose";

// This model is for the FULL PAGE VIEW
// It contains the heavy HTML body and PDF links
const articleDetailSchema = new mongoose.Schema(
  {
    articleId: {
      type: String,
      required: true,
      ref: "Article",
      index: true,
    },
    body: { type: String }, // Full HTML content from Admin
    contentUrl: { type: String }, // Optional PDF URL
  },
  { collection: "articledetails" }
);

export default mongoose.model("ArticleDetail", articleDetailSchema);
