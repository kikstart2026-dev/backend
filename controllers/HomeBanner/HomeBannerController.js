const mongoose = require("mongoose");
const HomeBannerModel = require("../../models/HomeBanner/HomeBannerModel");


// ==========================
// ✅ CREATE
// ==========================
exports.createHomeBanner = async (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({
        status: "error",
        message: "Request body is missing",
      });
    }

    const { headingId, image } = req.body;

    if (!headingId || !image) {
      return res.status(400).json({
        status: "error",
        message: "headingId & image are required",
      });
    }

    const newBanner = await HomeBannerModel.create({
      headingId,
      image,
      isActive: false   // ✅ active field
    });

    res.status(201).json({
      status: "success",
      message: "Home Banner created successfully",
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

      // ✅ ACTIVE FIRST + NEWEST
      {
        $sort: {
          isActive: -1,
          createdAt: -1,
        },
      },

      {
        $project: {
          image: 1,
          isActive: 1,   // ✅ send active status
          "headingData._id": 1,
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

    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await HomeBannerModel.aggregate([

      {
        $match: {
          _id: new mongoose.Types.ObjectId(mongoId),
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
          isActive: 1,  // ✅
          "headingData._id": 1,
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

    const { headingId, image } = req.body;

    const updatedData = await HomeBannerModel.findByIdAndUpdate(
      req.params.id,
      { headingId, image },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        status: "error",
        message: "Home Banner not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Home Banner updated successfully",
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
// ✅ TOGGLE ACTIVE
// ==========================
exports.toggleActiveBanner = async (req, res) => {
  try {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    // deactivate all banners
    await HomeBannerModel.updateMany({}, { isActive: false });

    // activate selected banner
    const banner = await HomeBannerModel.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        status: "error",
        message: "Banner not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Banner activated successfully",
      data: banner,
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
        message: "Home Banner not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Home Banner deleted successfully",
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
      message: "All Home Banners deleted",
      deletedCount: result.deletedCount,
    });

  } catch (err) {

    res.status(500).json({
      status: "error",
      message: err.message,
    });

  }
};