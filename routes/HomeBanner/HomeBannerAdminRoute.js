const express = require("express");
const router = express.Router();

const controller = require("../../controllers/HomeBanner/HomeBannerController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");


// ================= CREATE =================
router.post(
  "/create",
  protect,
  checkPermission("Home Banner Control", "create"),
  controller.createHomeBanner
);


// ================= GET ALL =================
router.get(
  "/",
  protect,
  checkPermission("Home Banner Control", "read"),
  controller.getAllHomeBanner
);


// ================= ACTIVE TOGGLE =================
router.put(
  "/active/:id",
  protect,
  checkPermission("Home Banner Control", "update"),
  controller.toggleActiveBanner
);


// ================= GET SINGLE =================
router.get(
  "/:id",
  protect,
  checkPermission("Home Banner Control", "read"),
  controller.getHomeBannerById
);


// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  checkPermission("Home Banner Control", "update"),
  controller.updateHomeBanner
);


// ================= DELETE SELECTIVE =================
router.delete(
  "/select/delete",
  protect,
  checkPermission("Home Banner Control", "delete"),
  controller.selectiveDeleteHomeBanner
);


// ================= DELETE ALL =================
router.delete(
  "/delete/all",
  protect,
  checkPermission("Home Banner Control", "delete"),
  controller.multipleDeleteHomeBanner
);


// ================= DELETE SINGLE =================
router.delete(
  "/:id",
  protect,
  checkPermission("Home Banner Control", "delete"),
  controller.singleDeleteHomeBanner
);

module.exports = router;