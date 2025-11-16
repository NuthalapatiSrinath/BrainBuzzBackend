import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // we use short keys like "upsc", "cgl"
    title: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "categories" }
);

export default mongoose.model("Category", categorySchema);
