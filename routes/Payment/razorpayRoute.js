const express = require("express");

const router = express.Router();

const razorpayInstance =
  require("../../config/razorpay");

const {
  getAllPayments,
} = require("../../controllers/Payment/razorpay");


// CREATE ORDER
router.post(
  "/kikPayment",
  async (req, res) => {

    const {
      amount,
      currency,
      fullname,
      email,
    } = req.body;

    try {

      const options = {

        amount:
          amount * 100,

        currency:
          currency || "INR",

        notes: {

          fullname,

          email,
        },
      };

      const order =
        await razorpayInstance.orders.create(
          options
        );

      res.status(200).json(order);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Error creating Razorpay order",
        error:
          error.message,
      });
    }
  }
);


// GET ALL PAYMENTS
router.get(
  "/all-payments",
  getAllPayments
);

module.exports = router;