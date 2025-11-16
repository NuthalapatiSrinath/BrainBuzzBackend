// src/database/models/subscription.model.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    plan: { type: String, default: "free" },
    status: {
      type: String,
      enum: ["active", "cancelled", "trial"],
      default: "active",
    },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { collection: "subscriptions" }
);

export default mongoose.model("Subscription", subscriptionSchema);
