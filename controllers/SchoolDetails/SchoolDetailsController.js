const mongoose = require("mongoose");

const school = require("../../models/SchoolDetails/schoolDetailsModel");



// CREATE
exports.createSchool = async (req, res) => {
  try {

    const {
      schoolName,
      schoolLocation,
    } = req.body;

    if (
      !schoolName ||
      !schoolLocation
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newSchool = await school.create({
      schoolName,
      schoolLocation,
    });

    return res.status(201).json({
      success: true,
      message: "School details created successfully",
      data: newSchool,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// GET ALL
exports.getAllSchool = async (req, res) => {
  try {

    const data = await school.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: data.length,
      data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// GET BY ID
exports.getSchoolById = async (req, res) => {
  try {

    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const data = await school.findById(schoolId);

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

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// UPDATE
exports.updateSchool = async (req, res) => {
  try {

    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const {
      schoolLocation,
    } = req.body;

    const updatedData = {
      schoolLocation,
    };

    const updatedSchool = await school.findByIdAndUpdate(
      schoolId,
      updatedData,
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

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// DELETE
exports.deleteSchool = async (req, res) => {
  try {

    const schoolId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid school id",
      });
    }

    const deletedSchool = await school.findByIdAndDelete(
      schoolId
    );

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

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// DELETE ALL
exports.deleteAllSchool = async (req, res) => {
  try {

    const result = await school.deleteMany({});

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