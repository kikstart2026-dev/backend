const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Schools/SchoolsController");

// ==========================
// ✅ CREATE
// ==========================
router.post("/create", controller.createSchool);


// ==========================
// ✅ GET ALL
// ==========================
router.get("/", controller.getSchools);


// ==========================
// ✅ GET BY ID
// ==========================

router.get("/:id", controller.getSingleSchool);


// ==========================
// ✅ UPDATE
// ==========================
router.put("/:id", controller.updateSchool);


// ==========================
// ✅ DELETE BY ID
// ==========================
router.delete("/:id", controller.deleteSchoolById);


// ==========================
// ✅ DELETE ALL
// ==========================
router.delete("/", controller.deleteAllSchools);


// ==========================
// ✅ DELETE SELECTED
// ==========================
router.post("/delete-selected", controller.deleteSelectedSchools);


module.exports = router;