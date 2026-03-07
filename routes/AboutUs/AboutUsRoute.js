const express = require("express");
const router = express.Router();

const controller = require("../../controllers/AboutUs/AboutUsController");

// Create
router.post("/create", controller.createAbout);

// Get All
router.get("/", controller.getAllAbout);

// Get By ID
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