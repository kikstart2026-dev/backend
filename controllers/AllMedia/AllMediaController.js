const AllImage = require("../../models/AllMedia/AllMediaModel");
const path = require("path");
const fs = require("fs");

// helper function
const getFolderName = (destinationPath) => {
  return path.basename(destinationPath);
};

// ✅ CREATE
exports.createFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const folderName = getFolderName(req.file.destination);

    const newFile = await AllImage.create({
      filename: req.file.filename,
      path: `/uploads/${folderName}/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({
      status: "success",
      results: 1,
      data: [newFile],
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ GET ALL
exports.getAllFiles = async (req, res) => {
  try {
    const files = await AllImage.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: files.length,
      data: files,
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ GET BY ID
exports.getFileById = async (req, res) => {
  try {
    const file = await AllImage.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    res.status(200).json({
      status: "success",
      results: 1,
      data: [file],
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ UPDATE
exports.updateFile = async (req, res) => {
  try {
    const file = await AllImage.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    if (req.file) {
      const oldFilePath = path.join(__dirname, "../../", file.path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const folderName = getFolderName(req.file.destination);

      file.filename = req.file.filename;
      file.path = `/uploads/${folderName}/${req.file.filename}`;
      file.mimetype = req.file.mimetype;
      file.size = req.file.size;
    }

    await file.save();

    res.status(200).json({
      status: "success",
      results: 1,
      data: [file],
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ DELETE BY ID
exports.deleteById = async (req, res) => {
  try {
    const file = await AllImage.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const filePath = path.join(__dirname, "../../", file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.status(200).json({
      status: "success",
      results: 1,
      data: [],
      message: "File deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ DELETE ALL
exports.deleteAll = async (req, res) => {
  try {
    const files = await AllImage.find();

    for (const file of files) {
      const filePath = path.join(__dirname, "../../", file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await AllImage.deleteMany();

    res.status(200).json({
      status: "success",
      deleteCount: files.length,
      data: [],
      message: "All files deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ SELECTIVE DELETE
exports.selectiveDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Please provide array of ids",
      });
    }

    const files = await AllImage.find({ _id: { $in: ids } });

    for (const file of files) {
      const filePath = path.join(__dirname, "../../", file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await AllImage.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: "success",
      deleteCount: files.length,
      data: [],
      message: "Selected files deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};