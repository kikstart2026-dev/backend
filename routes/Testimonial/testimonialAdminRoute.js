const express = require("express");
const router = express.Router();

const testimonialController = require("../../controllers/Testimonials/testimonialController");

// CREATE
router.post("/create", testimonialController.create);

// GET ALL
router.get("/", testimonialController.getAll);

// GET BY ID
router.get("/:id", testimonialController.getCardById);

// UPDATE
router.put("/update/:id", testimonialController.updateCard);

// DELETE SINGLE
router.delete("/delete/:id", testimonialController.singleDeleteCard);

// DELETE SELECTIVE
router.delete("/delete-selected", testimonialController.selectiveDeleteCard);

// DELETE ALL
router.delete("/delete-all", testimonialController.multipleDeleteCard);

module.exports = router;
