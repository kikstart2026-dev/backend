const express = require("express");

const router = express.Router();

const {

  createPlan,

  getAllPlans,

  getSinglePlan,

  updatePlan,

  deletePlan,

} = require( "../../controllers/Subscription/SubscriptionController" );

router.post( "/create", createPlan );

router.get( "/all", getAllPlans );

router.get( "/single/:id", getSinglePlan );

router.put( "/update/:id", updatePlan );

router.delete( "/delete/:id", deletePlan );

module.exports = router;