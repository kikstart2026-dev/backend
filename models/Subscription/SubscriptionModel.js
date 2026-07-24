// ========================================
// models/Subscription.js
// ========================================

const mongoose =
  require("mongoose");

const subscriptionSchema =
  new mongoose.Schema({

    planName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    maxChildren: {
      type: Number,
      default: 1,
    },

    planType: {
      type: String,
      enum: ["monthly", "onetime"],
      required: true,
    },

    durationDays: {
      type: Number,
      default: 30,
    },

    permissions: {

      feature1: {
        type: Boolean,
        default: false,
      },

      feature2: {
        type: Boolean,
        default: false,
      },

      feature3: {
        type: Boolean,
        default: false,
      },

      feature4: {
        type: Boolean,
        default: false,
      },

      feature5: {
        type: Boolean,
        default: false,
      },

      feature6: {
        type: Boolean,
        default: false,
      },

    },

    isActive: {
      type: Boolean,
      default: true,
    },

  }, {
    timestamps: true,
  });

module.exports = mongoose.model("Subscription", subscriptionSchema);