const express = require("express");
const router = express.Router();

const controller = require("../../controllers/AboutUs/AboutUsController");


// Get All
router.get("/", controller.getAllAbout);

// Get By ID
router.get("/:id", controller.getAboutById);



module.exports = router;