const User = require("../models/authModel");

// ================== GET ALL USERS ==================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== GET single USERS ==================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================== UPDATE NON-SENSITIVE DATA ==================
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { fullname, phone, location, isVerified, role } = req.body || {};

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullname) user.fullname = fullname;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    if (req.file) {
      user.image = req.file.path;
    }

    if (isVerified !== undefined) {
      user.isVerified = isVerified === true || isVerified === "true";
    }

    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== DELETE SINGLE USER ==================
exports.deleteSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== DELETE MULTIPLE USERS ==================
exports.deleteMultipleUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "Please provide userIds array",
      });
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
    });

    res.status(200).json({
      message: "Selected users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== DELETE ALL USERS (DANGEROUS) ==================
exports.deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});

    res.status(200).json({
      message: "All users deleted successfully 🚨",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};