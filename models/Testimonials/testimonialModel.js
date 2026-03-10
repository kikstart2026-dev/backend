const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
  {
    headingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Heading",
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Testimonial", TestimonialSchema);
