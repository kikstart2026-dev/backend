// ========================================
// models/Payment.js
// ========================================

const mongoose = require("mongoose");

const subscriptionPaymentSchema =
  new mongoose.Schema(
    {
      fullname: String,

      email: String,

      phone: String,

      subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
      },

      planName: String,

      amount: Number,

      // ================= NEW FIELDS =================

      payment_id: String,

      order_id: String,

      currency: String,

      status: {
        type: String,
        default: "captured",
      },

      method: String,

      created_at: String,

      fee: Number,

      tax: Number,

      refund_status: String,

      description: String,

      // ================= DATE =================

      paymentDate: {
        type: Date,
        default: Date.now,
      },

      expireDate: Date,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "SubscriptionPayment",
  subscriptionPaymentSchema
);