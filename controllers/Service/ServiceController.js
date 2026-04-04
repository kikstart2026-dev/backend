const mongoose = require("mongoose");
const ServiceModel = require("../../models/Service/ServiceModel");


// ==========================
// ✅ CREATE
// ==========================
exports.createService = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: "error",
        message: "Request body is missing",
      });
    }

    const { headingId, title, details, image } = req.body;

    if (!headingId || !title || !details || !image) {
      return res.status(400).json({
        status: "error",
        message: "headingId, title, details & image are required",
      });
    }

    const newService = await ServiceModel.create({
      headingId,
      title,
      details,
      image,
    });

    res.status(201).json({
      status: "success",
      message: "Service created successfully",
      data: newService,
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
exports.getAllService = async (req, res) => {
  try {
    const data = await ServiceModel.aggregate([
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
          title: 1,
          details: 1,
          image: 1,
          "headingData._id": 1,
          "headingData.tagline": 1,
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
exports.getServiceById = async (req, res) => {
  try {
    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await ServiceModel.aggregate([
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
          title: 1,
          details: 1,
          image: 1,
          "headingData._id": 1,
          "headingData.tagline": 1,
          "headingData.heading": 1,
          "headingData.description": 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
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
exports.updateService = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const { headingId, title, details, image } = req.body;

    const updatedData = await ServiceModel.findByIdAndUpdate(
      req.params.id,
      { headingId, title, details, image },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Service updated successfully",
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
exports.singleDeleteService = async (req, res) => {
  try {
    const data = await ServiceModel.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Service deleted successfully",
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
exports.selectiveDeleteService = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "error",
        message: "Provide array of ids",
      });
    }

    const result = await ServiceModel.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      status: "success",
      message: "Selected Services deleted",
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
exports.multipleDeleteService = async (req, res) => {
  try {
    const result = await ServiceModel.deleteMany({});

    res.status(200).json({
      status: "success",
      message: "All Services deleted",
      deletedCount: result.deletedCount,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};