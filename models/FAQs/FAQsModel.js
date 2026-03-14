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
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Faq", faqSchema);