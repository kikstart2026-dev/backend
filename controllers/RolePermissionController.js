const Permission = require("../models/RolePermissionModel");
const mongoose = require("mongoose");

// CREATE
exports.createPermission = async (req, res) => {
  try {
    const { role, module, create, view, edit, delete: del } = req.body;

    const permission = await Permission.create({
      role,
      module,
      create,
      view,
      edit,
      delete: del,
    });

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔥 GET ALL WITH AGGREGATE (IMPORTANT)
exports.getPermissions = async (req, res) => {
  try {
    const data = await Permission.aggregate([
      {
        $lookup: {
          from: "modules", // collection name (lowercase plural)
          localField: "module",
          foreignField: "_id",
          as: "moduleData",
        },
      },
      {
        $unwind: "$moduleData",
      },
      {
        $project: {
          role: 1,
          create: 1,
          view: 1,
          edit: 1,
          delete: 1,
          moduleName: "$moduleData.name",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ONE
exports.getPermissionById = async (req, res) => {
  try {
    const data = await Permission.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "modules",
          localField: "module",
          foreignField: "_id",
          as: "moduleData",
        },
      },
      { $unwind: "$moduleData" },
    ]);

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updatePermission = async (req, res) => {
  try {
    const updated = await Permission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deletePermission = async (req, res) => {
  try {
    await Permission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Permission deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};