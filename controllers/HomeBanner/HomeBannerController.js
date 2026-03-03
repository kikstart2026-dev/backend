const mongoose = require("mongoose");
const HomeBannerModel = require("../../models/HomeBanner/HomeBannerModel");


// ==========================
// ✅ CREATE
// ==========================
exports.createHomeBanner = async (req, res) => {
  try {
    const { headingId } = req.body;

    if (!headingId) {
      return res.status(400).json({
        status: "error",
        message: "headingId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image file is required",
      });
    }

    const newBanner = await HomeBannerModel.create({
      headingId,
      image: `/uploads/images/${req.file.filename}`, // ✅ CLEAN PATH
    });

    res.status(201).json({
      status: "success",
      message: "HomeBanner created successfully",
      data: newBanner,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// ==========================
// ✅ GET ALL (Aggregate)
// ==========================
exports.getAllHomeBanner = async (req, res) => {
  try {
    const data = await HomeBannerModel.aggregate([
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData",
        },
      },
      { $unwind: "$headingData" },
      {
        $project: {
          image: 1,
          createdAt: 1,
          updatedAt: 1,
          "headingData.subheading": 1,
          "headingData.heading": 1,
          "headingData.description": 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// ==========================
// ✅ GET BY ID
// ==========================
exports.getHomeBannerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await HomeBannerModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData",
        },
      },
      { $unwind: "$headingData" },
      {
        $project: {
          image: 1,
          "headingData.subheading": 1,
          "headingData.heading": 1,
          "headingData.description": 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({
        status: "error",
        message: "HomeBanner not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: data[0],
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
exports.updateHomeBanner = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const { headingId } = req.body;

    let updateData = {};

    if (headingId) {
      updateData.headingId = headingId;
    }

    if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`; // ✅ CLEAN PATH
    }

    const updatedData = await HomeBannerModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" } // ✅ mongoose warning fix
    );

    if (!updatedData) {
      return res.status(404).json({
        status: "error",
        message: "HomeBanner not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "HomeBanner updated successfully",
      data: updatedData,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// ==========================
// ✅ DELETE SINGLE
// ==========================
exports.singleDeleteHomeBanner = async (req, res) => {
  try {
    const data = await HomeBannerModel.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "HomeBanner not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "HomeBanner deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// ==========================
// ✅ DELETE SELECTIVE
// ==========================
exports.selectiveDeleteHomeBanner = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "error",
        message: "Provide array of ids",
      });
    }

    const result = await HomeBannerModel.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      status: "success",
      message: "Selected HomeBanners deleted",
      deletedCount: result.deletedCount,
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
exports.multipleDeleteHomeBanner = async (req, res) => {
  try {
    const result = await HomeBannerModel.deleteMany({});

    res.status(200).json({
      status: "success",
      message: "All HomeBanners deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};