const mongoose = require("mongoose");
const AboutUsModel = require("../../models/AboutUs/AboutUsModel");


// CREATE
exports.createAbout = async (req, res) => {
  try {
    const { headingId, image } = req.body;

    if (!headingId || !image) {
      return res.status(400).json({
        status: "error",
        message: "headingId and image are required",
      });
    }

    const newData = await AboutUsModel.create({
      headingId,
      image,
      isActive: false,
    });

    res.status(201).json({
      status: "success",
      message: "About section created successfully",
      data: newData,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// GET ALL
exports.getAllAbout = async (req, res) => {
  try {

    const data = await AboutUsModel.aggregate([
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
        $sort: {
          createdAt: 1,
          _id: 1
        },
      },

      {
        $project: {
          image: 1,
          isActive: 1,
          createdAt: 1,
          headingData: {
            _id: "$headingData._id",
            tagline: "$headingData.tagline",
            heading: "$headingData.heading",
            description: "$headingData.description",
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "About section fetched successfully",
      data,
      count: data.length,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET BY ID
exports.getAboutById = async (req, res) => {
  try {

    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await AboutUsModel.aggregate([
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

      {
        $unwind: {
          path: "$headingData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          image: 1,
          isActive: 1,
          "headingData.tagline": 1,
          "headingData.heading": 1,
          "headingData.description": 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({
        status: "error",
        message: "About section not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "About section fetched successfully",
      data: data[0],
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// UPDATE
exports.updateAbout = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const { headingId, image } = req.body;

    const updatedData = await AboutUsModel.findByIdAndUpdate(
      req.params.id,
      { headingId, image },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        status: "error",
        message: "About section not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "About section updated successfully",
      data: updatedData,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// TOGGLE ACTIVE
exports.toggleActiveAbout = async (req, res) => {
  try {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    await AboutUsModel.updateMany(
      { _id: { $ne: id } },
      { $set: { isActive: false } }
    );

    const about = await AboutUsModel.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!about) {
      return res.status(404).json({
        status: "error",
        message: "About section not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "About section activated successfully",
      data: about,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// DELETE SINGLE
exports.singleDeleteAbout = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await AboutUsModel.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "About section not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "About section deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// SELECTIVE DELETE
exports.selectiveDeleteAbout = async (req, res) => {
  try {

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "error",
        message: "Provide array of ids",
      });
    }

    const result = await AboutUsModel.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      status: "success",
      message: "Selected sections deleted",
      deletedCount: result.deletedCount,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};


// DELETE ALL
exports.multipleDeleteAbout = async (req, res) => {
  try {

    const result = await AboutUsModel.deleteMany({});

    res.status(200).json({
      status: "success",
      message: "All About sections deleted",
      deletedCount: result.deletedCount,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};