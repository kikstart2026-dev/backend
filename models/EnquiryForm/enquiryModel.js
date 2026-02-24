const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    school: {
      type: String,
      required: true,
      trim: true,
    },
    
    contactPerson: {
        type: String,
        required: true,
        trim: true,
    },

    schoolEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    schoolPhone: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry-Detail", enquirySchema);