const express = require("express");
const router = express.Router();

const controller = require("../../controllers/WhyChooseUs/WhyChooseUsController");

// GET ALL
router.get("/", controller.getAllCards);

// GET BY ID
router.get("/:id", controller.getCardById);

module.exports = router;
