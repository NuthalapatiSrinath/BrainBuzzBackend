// src/database/models/media.model.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "pdf", "video", "other"],
      default: "image",
    },
    url: { type: String, required: true },
    filename: { type: String },
    size: { type: Number },
    meta: { type: mongoose.Schema.Types.Mixed },
    uploadedBy: { type: String }, // user id
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "media" }
);

export default mongoose.model("Media", mediaSchema);
