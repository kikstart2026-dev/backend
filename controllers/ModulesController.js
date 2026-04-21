const Module = require("../models/ModulesModel");

// CREATE
exports.createModule = async (req, res) => {
  try {
    const { name } = req.body;

    const module = await Module.create({ name });

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find();

    res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ONE
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: module,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteModule = async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Module deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};