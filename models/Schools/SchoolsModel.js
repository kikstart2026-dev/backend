const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String, // image URL (from your image API)
      required: [true, "Image is required"],
    },
    coach: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      default: "",
    },
    authorImg: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School", schoolSchema);