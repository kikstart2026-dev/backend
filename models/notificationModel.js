const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KikstartUser",
      required: true,
    },

    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Children-Detail",
      default: null,
    },

    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "child_assigned",
        "program_assigned",
      ],
      default: "child_assigned",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);