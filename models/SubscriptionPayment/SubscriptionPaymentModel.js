// ========================================
// models/Payment.js
// ========================================

const mongoose = require("mongoose");

const subscriptionPaymentSchema =
  new mongoose.Schema({

    fullname: String,

    email: String,

    phone: String,

    subscriptionId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Subscription",

    },

    planName: String,

    amount: Number,

    paymentDate: {

      type: Date,

      default: Date.now,

    },

    expireDate: Date,

    status: {

      type: String,

      default: "captured",

    },

  }, {
    timestamps: true,
  });

module.exports = mongoose.model( "SubscriptionPayment", subscriptionPaymentSchema );