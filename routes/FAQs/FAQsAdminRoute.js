const express = require("express");
const router = express.Router();

const controller = require("../../controllers/FAQs/FAQsController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");

// ================= CREATE =================
router.post(
  "/create",
  protect,
  checkPermission("FAQ Control", "create"),
  controller.createFaq
);

// ================= GET ALL =================
router.get(
  "/",
  protect,
  checkPermission("FAQ Control", "read"),
  controller.getFaqs
);

// ================= GET SINGLE =================
router.get(
  "/:id",
  protect,
  checkPermission("FAQ Control", "read"),
  controller.getSingleFaq
);

// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  checkPermission("FAQ Control", "update"),
  controller.updateFaq
);

// ================= ACTIVE TOGGLE =================
router.patch(
  "/toggle/:id",
  protect,
  checkPermission("FAQ Control", "update"),
  controller.toggleActiveFaq
);

// ================= DELETE SINGLE =================
router.delete(
  "/:id",
  protect,
  checkPermission("FAQ Control", "delete"),
  controller.deleteFaq
);

// ================= DELETE SELECTIVE =================
router.delete(
  "/delete-selective",
  protect,
  checkPermission("FAQ Control", "delete"),
  controller.selectiveDeleteFaq
);

// ================= DELETE ALL =================
router.delete(
  "/delete-all",
  protect,
  checkPermission("FAQ Control", "delete"),
  controller.multipleDeleteFaq
);

module.exports = router;