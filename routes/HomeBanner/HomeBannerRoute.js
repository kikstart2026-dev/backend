const express = require("express");
const router = express.Router();
const controller = require("../../controllers/HomeBanner/HomeBannerController");
const upload = require("../../middleware/uploadMiddleware");


// ✅ Create (Image Upload Required)
router.post(
  "/create",
  upload.single("image"),   // 🔥 image field name must match form-data key
  controller.createHomeBanner
);


// ✅ Get All
router.get("/", controller.getAllHomeBanner);


// ✅ Get By ID
router.get("/:id", controller.getHomeBannerById);


// ✅ Update (Image Optional)
router.put(
  "/:id",
  upload.single("image"),   // 🔥 new image optional
  controller.updateHomeBanner
);


// ⚠ Specific delete routes must come BEFORE :id

// ✅ Delete Selective
router.delete("/select/delete", controller.selectiveDeleteHomeBanner);

// ✅ Delete All
router.delete("/delete/all", controller.multipleDeleteHomeBanner);

// ✅ Delete Single
router.delete("/:id", controller.singleDeleteHomeBanner);


module.exports = router;