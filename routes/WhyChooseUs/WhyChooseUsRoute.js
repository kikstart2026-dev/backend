const express = require("express");
const router = express.Router();

const controller = require("../../controllers/WhyChooseUs/WhyChooseUsController");

// Create
router.post("/create", controller.createCard);

// Get All
router.get("/", controller.getAllCards);

// Get By ID
router.get("/:id", controller.getCardById);

// Update 
router.put("/:id", controller.updateCard);

// Delete Selective
router.delete("/select/delete", controller.selectiveDeleteCard);

// Delete All
router.delete("/delete/all", controller.multipleDeleteCard);

// Delete Single
router.delete("/:id", controller.singleDeleteCard);


module.exports = router;