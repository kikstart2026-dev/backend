const express = require("express");
const router = express.Router();
const controller = require("../../controllers/HomeBanner/HomeBannerController");



// Get All
router.get("/", controller.getAllHomeBanner);

// Get By ID
router.get("/:id", controller.getHomeBannerById);


module.exports = router;