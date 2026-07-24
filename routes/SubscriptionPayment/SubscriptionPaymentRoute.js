const express = require("express");

const router = express.Router();

const {

  getAllPayments,

  saveSubscription,

  getUserActivePlan,

  deletePayment,

  getMyPayments,

  getMonthlyPlanRevenue,

  exportPaymentsCSV

} = require("../../controllers/SubscriptionPayment/SubscriptionPaymentController");

router.get("/all-payments", getAllPayments);

router.get("/export-CSV", exportPaymentsCSV);

router.post("/save-subscription", saveSubscription);

router.get("/active-plan/:email", getUserActivePlan);

router.get( "/my-payments/:email", getMyPayments);



// Revenue Management
router.get(
  "/monthly-plan-revenue",
  getMonthlyPlanRevenue
);

module.exports = router;