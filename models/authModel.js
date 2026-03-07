const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    location: {
      type: String,
    },

    passcode: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    // 🖼️ IMAGE FIELD ADD KORA HOLO
    image: {
      type: String, // image URL
      default: null,
    },

    otp: {
      type: Number,
    },

    otpExpiry: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "coach", "admin", "superadmin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KikstartUser", userSchema);