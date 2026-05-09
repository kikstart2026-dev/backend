const express = require("express");
const router = express.Router();

const controller = require("../../controllers/Schools/SchoolsController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");


// ==========================
// ✅ CREATE
// ==========================
router.post(
  "/create",
  protect,
  checkPermission("Interested Schools", "create"),
  controller.createSchool
);


// ==========================
// ✅ GET ALL
// ==========================
router.get(
  "/",
  protect,
  checkPermission("Interested Schools", "read"),
  controller.getSchools
);


// ==========================
// ✅ GET BY ID
// ==========================
router.get(
  "/:id",
  protect,
  checkPermission("Interested Schools", "read"),
  controller.getSingleSchool
);


// ==========================
// ✅ UPDATE
// ==========================
router.put(
  "/:id",
  protect,
  checkPermission("Interested Schools", "update"),
  controller.updateSchool
);


// ==========================
// ✅ DELETE BY ID
// ==========================
router.delete(
  "/:id",
  protect,
  checkPermission("Interested Schools", "delete"),
  controller.deleteSchoolById
);


// ==========================
// ✅ DELETE ALL
// ==========================
router.delete(
  "/",
  protect,
  checkPermission("Interested Schools", "delete"),
  controller.deleteAllSchools
);


// ==========================
// ✅ DELETE SELECTED
// ==========================
router.post(
  "/delete-selected",
  protect,
  checkPermission("Interested Schools", "delete"),
  controller.deleteSelectedSchools
);

module.exports = router;