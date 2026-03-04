const express = require("express");
const router = express.Router();
const controller = require("../../controllers/HomeBanner/HomeBannerController");

// create
router.post("/create", controller.createHomeBanner);


// Get All
router.get("/", controller.getAllHomeBanner);


// Get By ID
router.get("/:id", controller.getHomeBannerById);


// Update
router.put("/:id", controller.updateHomeBanner);

// Delete Selective
router.delete("/select/delete", controller.selectiveDeleteHomeBanner);

// Delete All
router.delete("/delete/all", controller.multipleDeleteHomeBanner);

// Delete Single
router.delete("/:id", controller.singleDeleteHomeBanner);


module.exports = router;