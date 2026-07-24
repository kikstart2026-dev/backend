const express = require("express");
const router = express.Router();

const controller = require("../../controllers/WhyChooseUs/WhyChooseUsController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");


// ================= CREATE =================
router.post(
  "/create",
  protect,
  checkPermission("Why Choose Us Control", "create"),
  controller.createCard
);


// ================= GET ALL =================
router.get(
  "/",
  protect,
  checkPermission("Why Choose Us Control", "read"),
  controller.getAllCards
);


// ================= GET SINGLE =================
router.get(
  "/:id",
  protect,
  checkPermission("Why Choose Us Control", "read"),
  controller.getCardById
);


// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  checkPermission("Why Choose Us Control", "update"),
  controller.updateCard
);


// ================= DELETE SELECTIVE =================
router.delete(
  "/select/delete",
  protect,
  checkPermission("Why Choose Us Control", "delete"),
  controller.selectiveDeleteCard
);


// ================= DELETE ALL =================
router.delete(
  "/delete/all",
  protect,
  checkPermission("Why Choose Us Control", "delete"),
  controller.multipleDeleteCard
);


// ================= DELETE SINGLE =================
router.delete(
  "/:id",
  protect,
  checkPermission("Why Choose Us Control", "delete"),
  controller.singleDeleteCard
);

module.exports = router;