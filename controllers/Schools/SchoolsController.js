const mongoose = require("mongoose");
const School = require("../../models/Schools/SchoolsModel");


// ==========================
// ✅ CREATE
// ==========================
exports.createSchool = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: "error",
        message: "Request body is missing",
      });
    }

    const { title, description, image, coach, author, authorImg } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        status: "error",
        message: "title & image are required",
      });
    }

    const newSchool = await School.create({
      title,
      description,
      image,
      coach,
      author,
      authorImg,
    });

    res.status(201).json({
      status: "success",
      message: "School created successfully",
      data: newSchool,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ GET ALL (Pagination)
// ==========================
exports.getSchools = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;

    const skip = (page - 1) * limit;

    const schools = await School.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await School.countDocuments();

    res.status(200).json({
      status: "success",
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: schools,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ GET SINGLE
// ==========================
exports.getSingleSchool = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID",
      });
    }

    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: school,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ UPDATE
// ==========================
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID",
      });
    }

    const updatedSchool = await School.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "School updated successfully",
      data: updatedSchool,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ DELETE BY ID
// ==========================
exports.deleteSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID",
      });
    }

    const deleted = await School.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "School not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "School deleted successfully",
      data: deleted,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ DELETE ALL
// ==========================
exports.deleteAllSchools = async (req, res) => {
  try {
    await School.deleteMany({});

    res.status(200).json({
      status: "success",
      message: "All schools deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// ==========================
// ✅ DELETE SELECTED
// ==========================
exports.deleteSelectedSchools = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No IDs provided",
      });
    }

    const result = await School.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      status: "success",
      message: "Selected schools deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};