const express = require("express");
const router = express.Router();
const controller = require("../../controllers/AboutUs/AboutUsController");

// Create
router.post("/create", controller.createAbout);

// Get All
router.get("/", controller.getAllAbout);

// active toggle
router.put("/active/:id", controller.toggleActiveAbout);

// Get By Id
router.get("/:id", controller.getAboutById);

// Update
router.put("/:id", controller.updateAbout);

// Delete Selective
router.delete("/select/delete", controller.selectiveDeleteAbout);

// Delete All
router.delete("/delete/all", controller.multipleDeleteAbout);

// Delete Single
router.delete("/:id", controller.singleDeleteAbout);

module.exports = router;