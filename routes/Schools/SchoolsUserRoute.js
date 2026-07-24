const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Schools/SchoolsController");

// ==========================
// ✅ GET ALL
// ==========================
router.get("/", controller.getSchools);


// ==========================
// ✅ GET BY ID
// ==========================
router.get("/:id", controller.getSingleSchool);


module.exports = router;