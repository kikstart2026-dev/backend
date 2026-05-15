const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    twilioConversationSid: {
      type: String,
      required: true,
      unique: true,
    },

    friendlyName: {
      type: String,
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KikstartUser",
      },
    ],

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KikstartUser",
      default: null,
    },

    groupImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);