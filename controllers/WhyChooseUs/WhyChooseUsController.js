const mongoose = require("mongoose");
const WhyChooseUsCardModel = require("../../models/WhyChooseUs/WhyChooseUsModel");


// ==========================
// ✅ CREATE
// ==========================
exports.createCard = async (req, res) => {
  try {
    const { headingId, title, description, color } = req.body;

    if (!headingId) {
      return res.status(400).json({
        status: "error",
        message: "headingId is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Icon file is required",
      });
    }
    
    if (!title) {
      return res.status(400).json({
        status: "error",
        message: "title is required",
      });
    }

    if (!color) {
      return res.status(400).json({
        status: "error",
        message: "color is required",
      });
    }

    const newCard = await WhyChooseUsCardModel.create({
      headingId,
      icon: `/uploads/images/${req.file.filename}`,
      title,
      description,
      color,
    });

    res.status(201).json({
      status: "success",
      message: "Why Choose Us card created successfully",
      data: newCard,
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
exports.getAllCards = async (req, res) => {
  try {
    const data = await WhyChooseUsCardModel.aggregate([
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
          icon: 1,
          title: 1,
          description: 1,
          color: 1,
          createdAt: 1,
          updatedAt: 1,
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
exports.getCardById = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await WhyChooseUsCardModel.aggregate([
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
          icon: 1,
          title: 1,
          description: 1,
          color: 1,
          "headingData.subheading": 1,
          "headingData.heading": 1,
          "headingData.description": 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({
        status: "error",
        message: "Card not found",
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
exports.updateCard = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const { headingId, title, description, color } = req.body;

    let updateData = {};

    if (headingId) updateData.headingId = headingId;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (color) updateData.color = color;

    if (req.file) {
      updateData.icon = `/uploads/images/${req.file.filename}`;
    }

    const updatedData = await WhyChooseUsCardModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        status: "error",
        message: "Card not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Card updated successfully",
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
exports.singleDeleteCard = async (req, res) => {
  try {

    const data = await WhyChooseUsCardModel.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Card not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Card deleted successfully",
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
exports.selectiveDeleteCard = async (req, res) => {
  try {

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "error",
        message: "Provide array of ids",
      });
    }

    const result = await WhyChooseUsCardModel.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      status: "success",
      message: "Selected cards deleted",
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
exports.multipleDeleteCard = async (req, res) => {
  try {

    const result = await WhyChooseUsCardModel.deleteMany({});

    res.status(200).json({
      status: "success",
      message: "All cards deleted",
      deletedCount: result.deletedCount,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};