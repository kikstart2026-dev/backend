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
<<<<<<< HEAD
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
=======
      type: String,
      enum: ["user", "admin", "subadmin"],
      default: "user",
>>>>>>> c0426f98740f3f0cb08245199933432fc2d596fe
    },

    dynamicRole: {
      type: String,
      default: null, // e.g. "manager", "editor"
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("KikstartUser", userSchema);
