const mongoose = require("mongoose");
const child = require("../../models/ChildrenForm/ChildrenFormModel");



exports.createChild = async (req, res) => {
  try {
    const {
      fullName,
      location,
      age,
      passCode,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
    } = req.body;

    // ✅ FILE COMES FROM req.file (NOT req.body)
    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!fullName || !location || !age || !passCode) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const newChild = await child.create({
      fullName,
      location,
      age,
      passCode,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      profileImage,
    });

    return res.status(201).json({
      success: true,
      message: "Child profile created successfully",
      data: newChild,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.getAllChild = async (req, res) => {
  try {

    const data = await child.find().sort({
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




exports.getChildById = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    const data = await child.findById(childId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
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




exports.updateChild = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    
    const {
      location,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      profileImage,
    } = req.body;

    const updatedData = {
      location,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      profileImage,
    };

    const updatedChild = await child.findByIdAndUpdate(
      childId,
      updatedData,
      { new: true }
    );

    if (!updatedChild) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Child profile updated successfully",
      data: updatedChild,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};




exports.deleteChild = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    const deletedChild = await child.findByIdAndDelete(
      childId
    );

    if (!deletedChild) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Child profile deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
  
};
exports.deleteAllChild = async (req, res) => {
  try {

    const result = await child.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All child profiles deleted successfully",
      deleteCount: result.deletedCount,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};