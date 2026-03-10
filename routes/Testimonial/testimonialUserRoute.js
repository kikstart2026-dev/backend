const express = require("express");
const router = express.Router();

const testimonialController = require("../../controllers/Testimonials/testimonialController");

// GET ALL
router.get("/", testimonialController.getAll);

// GET BY ID
router.get("/:id", testimonialController.getCardById);

module.exports = router;
