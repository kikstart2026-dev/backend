const express = require("express");

const router = express.Router();

const {

  getAllPayments,

  saveSubscription,

  getUserActivePlan,

  deletePayment,

} = require("../../controllers/SubscriptionPayment/SubscriptionPaymentController");

router.get( "/all-payments", getAllPayments);

router.post("/save-subscription", saveSubscription);

router.get("/active-plan/:email",getUserActivePlan);

router.delete("/refund/:paymentId", deletePayment);

module.exports = router;