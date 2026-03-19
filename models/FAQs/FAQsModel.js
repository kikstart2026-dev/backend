const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    headingId: {
      type: mongoose.Schema.Types.ObjectId, // it is to fetch the exact form of unique mongo id
      ref: "Heading",
      //  required: false,
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    // ✅ ACTIVE FIELD
    isActive: {
      type: Boolean,
      default: false,
       index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);