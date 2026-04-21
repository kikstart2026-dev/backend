const User = require("../models/authModel");
const bcrypt = require("bcryptjs");

exports.createSubAdmin = async (req, res) => {
  try {
    const {fullname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
    fullname,
      email,
      password: hashedPassword,
      role: "subadmin", // 🔥 fixed
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Subadmin created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllSubAdmins = async (req, res) => {
  try {
    const users = await User.find({ role: "subadmin" });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSubAdminById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const updateData = {};

    if (email) updateData.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, role: "subadmin" },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subadmin updated",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subadmin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignDynamicRole = async (req, res) => {
  try {
    const { dynamicRole } = req.body;

    if (!dynamicRole) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "subadmin" },
      { dynamicRole },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dynamic role assigned successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};