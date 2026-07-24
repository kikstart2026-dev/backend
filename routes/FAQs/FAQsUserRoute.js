const express = require("express");
const router = express.Router();

const controller = require("../../controllers/FAQs/FAQsController");


// Get All
router.get("/", controller.getFaqs);

// Get By ID
router.get("/:id", controller.getSingleFaq);


module.exports = router;