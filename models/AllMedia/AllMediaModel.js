const mongoose = require("mongoose");

const allImageSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
    },
    size: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AllMedia", allImageSchema);