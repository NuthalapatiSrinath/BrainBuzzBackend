import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    _id: { type: String }, // e.g. "upsc_ias"
    categoryKey: { type: String, required: true, index: true }, // link to Category._id
    title: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "subcategories" }
);

export default mongoose.model("Subcategory", subcategorySchema);
