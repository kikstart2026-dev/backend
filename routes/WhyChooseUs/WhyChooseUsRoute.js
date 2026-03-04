const express = require("express");
const router = express.Router();

const controller = require("../../controllers/WhyChooseUs/WhyChooseUsController");
const upload = require("../../middleware/uploadMiddleware");


// ==========================
// ✅ Create (Icon Upload Required)
// ==========================
router.post(
  "/create",
  upload.single("icon"),   // 🔥 icon field name must match form-data key
  controller.createCard
);


// ==========================
// ✅ Get All
// ==========================
router.get("/", controller.getAllCards);


// ==========================
// ✅ Get By ID
// ==========================
router.get("/:id", controller.getCardById);


// ==========================
// ✅ Update (Icon Optional)
// ==========================
router.put(
  "/:id",
  upload.single("icon"),   // 🔥 new icon optional
  controller.updateCard
);


// ⚠ Specific delete routes must come BEFORE :id

// ==========================
// ✅ Delete Selective
// ==========================
router.delete("/select/delete", controller.selectiveDeleteCard);


// ==========================
// ✅ Delete All
// ==========================
router.delete("/delete/all", controller.multipleDeleteCard);


// ==========================
// ✅ Delete Single
// ==========================
router.delete("/:id", controller.singleDeleteCard);


module.exports = router;