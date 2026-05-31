const mongoose =
  require("mongoose");

const subscriptionPaymentSchema =
  new mongoose.Schema(

    {

      fullname: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      subscriptionId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "Subscription",

        required: true,

      },

      planName: {
        type: String,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      // ================= RAZORPAY =================

      payment_id: {
        type: String,
        required: true,
        unique: true,
      },

      order_id: {
        type: String,
      },

      currency: {
        type: String,
        default: "INR",
      },

     status: {
  type: String,
  default: "captured",
},

      method: {
        type: String,
      },

      contact: {
        type: String,
      },

      created_at: {
        type: String,
      },

      fee: {
        type: Number,
        default: 0,
      },

      tax: {
        type: Number,
        default: 0,
      },

      refund_status: {
        type: String,
        default: null,
      },

      description: {
        type: String,
      },

      // ================= DATE =================

      paymentDate: {

        type: Date,

        default:
          Date.now,

      },

      expireDate: {
        type: Date,
      },

    },

    {
      timestamps: true,
    }

  );

module.exports =
  mongoose.model(

    "SubscriptionPayment",

    subscriptionPaymentSchema

  );