import mongoose from "mongoose";

const previousPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "General Studies Paper I"
    pdfUrl: { type: String, required: true }, // The link to the PDF

    categoryKey: { type: String, index: true },
    subcategoryId: { type: String, index: true },

    isPaid: { type: Boolean, default: false }, // Just in case you want premium papers later
    downloadCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "previous_papers" }
);

export default mongoose.model("PreviousPaper", previousPaperSchema);
