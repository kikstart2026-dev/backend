const mongoose = require("mongoose");

const whyChooseUsCardSchema = new mongoose.Schema(
  {
    headingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heading",
      required: true
    },

    icon: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    color: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhyChooseUsCard", whyChooseUsCardSchema);