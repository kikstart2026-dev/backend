const express = require("express");

const router = express.Router();

const schoolController = require("../../controllers/SchoolDetails/SchoolDetailsController");



// CREATE
router.post("/createSchool",schoolController.createSchool);


// GET ALL
router.get("/getAllSchool",schoolController.getAllSchool);


// GET BY ID
router.get("/getSchoolById/:id",schoolController.getSchoolById);


// UPDATE
router.put("/updateSchool/:id",schoolController.updateSchool);


// DELETE
router.delete("/deleteSchool/:id",schoolController.deleteSchool);


// DELETE ALL
router.delete("/deleteAllSchool",schoolController.deleteAllSchool);

module.exports = router;