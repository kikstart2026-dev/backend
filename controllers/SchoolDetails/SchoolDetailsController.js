const mongoose = require("mongoose");
const School = require("../../models/SchoolDetails/schoolDetailsModel");

/* ================================
   CREATE SCHOOL DETAILS
================================ */
exports.createSchoolDetails = async (req, res) => {
  try {
    const { schoolName, schoolLocation } = req.body;

    if (!schoolName || !schoolLocation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newSchool = await School.create({
      schoolName,
      schoolLocation,
    });

    return res.status(201).json({
      success: true,
      message: "School details created successfully",
      data: newSchool,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================================
   GET ALL SCHOOL DETAILS
================================ */
exports.getAllSchoolDetails = async (req, res) => {
  try {
    const data = await School.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      results: data.length,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================================
   GET SINGLE SCHOOL DETAILS
================================ */
exports.getSchoolDetailsById = async (req, res) => {
  try {
    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const data = await School.findById(schoolId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "School details not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================================
   UPDATE SCHOOL DETAILS
================================ */
exports.updateSchoolDetails = async (req, res) => {
  try {
    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const { schoolLocation } = req.body;

    const updatedSchool = await School.findByIdAndUpdate(
      schoolId,
      { schoolLocation },
      { new: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({
        success: false,
        message: "School details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School details updated successfully",
      data: updatedSchool,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================================
   DELETE SCHOOL DETAILS
================================ */
exports.deleteSchoolDetails = async (req, res) => {
  try {
    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const deletedSchool = await School.findByIdAndDelete(schoolId);

    if (!deletedSchool) {
      return res.status(404).json({
        success: false,
        message: "School details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School details deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================================
   DELETE ALL SCHOOL DETAILS
================================ */
exports.deleteAllSchoolDetails = async (req, res) => {
  try {
    const result = await School.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All school details deleted successfully",
      deleteCount: result.deletedCount,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};