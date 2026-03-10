const express = require("express");
const router = express.Router();

const controller = require("../../controllers/FAQs/FAQsController");

// Create
router.post("/create", controller.createFaq);

// Get All
router.get("/", controller.getFaqs);

// Get By ID
router.get("/:id", controller.getSingleFaq);

// Update
router.put("/:id", controller.updateFaq);

// Delete
router.delete("/:id", controller.deleteFaq);

module.exports = router;