import mongoose from "mongoose";

const previousPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "UPSC Prelims 2024 - Paper 1 (GS)"
    pdfUrl: { type: String, required: true },

    // --- NEW LOGO FIELD ---
    logo: { type: String },
    // ----------------------

    categoryKey: { type: String, index: true },
    subcategoryId: { type: String, index: true },

    // --- NEW FILTER FIELDS ---
    exam: { type: String, index: true }, // e.g. "Civil Services"
    year: { type: Number, index: true }, // e.g. 2024
    subject: { type: String, index: true }, // e.g. "History"
    language: { type: String, default: "en", index: true }, // "en", "hi", "te"

    // --- NEW MONTH FIELD ---
    month: { type: String, index: true }, // Format: "YYYY-MM"

    isPaid: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
  },
  { collection: "previous_papers" }
);

// Auto-populate 'month' from 'createdAt' if not provided
previousPaperSchema.pre("save", function (next) {
  if (!this.month && this.createdAt) {
    const d = new Date(this.createdAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    this.month = `${yyyy}-${mm}`;
  }
  next();
});

export default mongoose.model("PreviousPaper", previousPaperSchema);
