const mongoose = require("mongoose");

const childrenSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      trim: true,
    },

    passCode: {
      type: String,
      required: true,
      trim: true,
    },

    foodHabit: {
      type: String,
      trim: true,
    },

    allergy: {
      type: Boolean,
      default: false,
    },

    allergyDetails: {
      type: String,
      trim: true,
    },

    prolongDisease: {
      type: String,
      trim: true,
    },

    profileImage: {
      type: String,
      trim: true,
    },

    // ✅ ADD
    programAssignments: [
      {
        program: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service"
        },

        coach: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "KikstartUser"
        },

        assignedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Children-Detail", childrenSchema);