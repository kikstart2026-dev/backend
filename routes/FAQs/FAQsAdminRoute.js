const express = require("express");
const router = express.Router();

const controller = require("../../controllers/FAQs/FAQsController");

// Create
router.post("/create", controller.createFaq);

// Get All
router.get("/", controller.getFaqs);

// Get By ID
router.get("/:id", controller.getSingleFaq);

// Update
router.put("/:id", controller.updateFaq);

// ✅ TOGGLE ACTIVE
router.patch("/toggle/:id", controller.toggleActiveFaq);

// Delete Single
router.delete("/:id", controller.deleteFaq);

// ✅ SELECTIVE DELETE
router.post("/delete-selected", controller.selectiveDeleteFaq);

// ✅ DELETE ALL
router.delete("/delete-all", controller.multipleDeleteFaq);

module.exports = router;