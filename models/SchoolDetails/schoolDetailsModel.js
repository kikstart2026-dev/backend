const mongoose = require("mongoose");

const schoolDetailsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },

    schoolLocation: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("School-Details",schoolDetailsSchema);