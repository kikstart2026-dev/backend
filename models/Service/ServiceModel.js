const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    headingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Heading",
          required: true
        },
    title:{
        type: String,
        required:true,
    },
    details:{
        type: String,
        required:true,
    },
    image: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
    details2: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);