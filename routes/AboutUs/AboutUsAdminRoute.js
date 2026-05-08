const express = require("express");
const router = express.Router();

const controller = require("../../controllers/AboutUs/AboutUsController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");


// ================= CREATE =================
router.post(
  "/create",
  protect,
  checkPermission("About Us Control", "create"),
  controller.createAbout
);


// ================= GET ALL =================
router.get(
  "/",
  protect,
  checkPermission("About Us Control", "read"),
  controller.getAllAbout
);


// ================= ACTIVE TOGGLE =================
router.put(
  "/active/:id",
  protect,
  checkPermission("About Us Control", "update"),
  controller.toggleActiveAbout
);


// ================= GET SINGLE =================
router.get(
  "/:id",
  protect,
  checkPermission("About Us Control", "read"),
  controller.getAboutById
);


// ================= UPDATE =================
router.put(
  "/:id",
  protect,
  checkPermission("About Us Control", "update"),
  controller.updateAbout
);


// ================= DELETE SELECTIVE =================
router.delete(
  "/select/delete",
  protect,
  checkPermission("About Us Control", "delete"),
  controller.selectiveDeleteAbout
);


// ================= DELETE ALL =================
router.delete(
  "/delete/all",
  protect,
 checkPermission("About Us Control", "delete"),
  controller.multipleDeleteAbout
);


// ================= DELETE SINGLE =================
router.delete(
  "/:id",
  protect,
  checkPermission("About Us Control", "delete"),
  controller.singleDeleteAbout
);

module.exports = router;