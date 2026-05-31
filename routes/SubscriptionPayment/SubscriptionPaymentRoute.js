const express = require("express");

const router = express.Router();

const {

  getAllPayments,

  saveSubscription,

  getUserActivePlan,

  deletePayment,

  getMyPayments,

} = require("../../controllers/SubscriptionPayment/SubscriptionPaymentController");

router.get("/all-payments", getAllPayments);

router.post("/save-subscription", saveSubscription);

router.get("/active-plan/:email", getUserActivePlan);

router.get( "/my-payments/:email", getMyPayments);

router.delete("/refund/:paymentId", deletePayment);

module.exports = router;