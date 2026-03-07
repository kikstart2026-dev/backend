const mongoose = require("mongoose");

const headingSchema = new mongoose.Schema(
  {
    subheading: {
      type: String,
    },
    
    heading: {
        type: String,
    },

    description: {
        type: String,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Heading", headingSchema);