const mongoose = require("mongoose");

const updateRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🔥 faster queries
    },

    requestedChanges: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true, // 🔐 prevent duplicate tokens
    },

    expiresAt: {
      type: Date,
      default: () => Date.now() + 10 * 60 * 1000, // ⏳ 10 minutes
      index: true,
    },

    // 🔥 Optional but VERY useful
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin id
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UpdateRequest", updateRequestSchema);