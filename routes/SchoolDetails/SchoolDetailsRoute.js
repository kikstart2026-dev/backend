const express = require("express");
const router = express.Router();

const schoolController = require("../../controllers/SchoolDetails/SchoolDetailsController");

/* ================================
   SCHOOL DETAILS ROUTES
================================ */

// CREATE
router.post("/createSchoolDetails", schoolController.createSchoolDetails);

// GET ALL
router.get("/getAllSchoolDetails", schoolController.getAllSchoolDetails);

// GET BY ID
router.get("/getSchoolDetailsById/:id", schoolController.getSchoolDetailsById);

// UPDATE
router.put("/updateSchoolDetails/:id", schoolController.updateSchoolDetails);

// DELETE SINGLE
router.delete("/deleteSchoolDetails/:id", schoolController.deleteSchoolDetails);

// DELETE ALL
router.delete("/deleteAllSchoolDetails", schoolController.deleteAllSchoolDetails);

module.exports = router;