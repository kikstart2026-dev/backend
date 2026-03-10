const mongoose = require("mongoose");
const testimonalModel = require("../../models/Testimonials/testimonialModel");


// CREATE
exports.create = async (req, res) => {
  try {
    const { headingId, image, name, description, designation } = req.body;

    if (!headingId) {
      return res.status(400).json({
        status: "error",
        message: "headingId is required",
      });
    }

    if (!image || !name || !designation || !description) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    const newTest = await testimonalModel.create({
      headingId,
      image,
      name,
      description,
      designation,
    });

    res.status(201).json({
      status: "success",
      message: "Testimonial card created successfully",
      data: newTest,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// GET ALL (Aggregate)
exports.getAll = async (req, res) => {
  try {

    const data = await testimonalModel.aggregate([
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
          name: 1,
          description: 1,
          designation: 1,
          headingData: {
            _id: "$headingData._id",
            tagline: "$headingData.tagline",
            heading: "$headingData.heading",
            description: "$headingData.description",
          },
        },
      },
    ]);

    const heading = data.length ? data[0].headingData : null;

    const cards = data.map((item) => ({
      _id: item._id,
      image: item.image,
      name: item.name,
      description: item.description,
      designation: item.designation,
    }));

    res.status(200).json({
      status: "success",
      message: "Testimonials fetched successfully",
      data: {
        heading,
        cards,
      },
      count: cards.length,
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};



// GET BY ID
exports.getCardById = async (req, res) => {
  try {

    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await testimonalModel.aggregate([
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
          name: 1,
          description: 1,
          designation: 1,
          "headingData.tagline": 1,
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
      message: "Card fetched successfully",
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
exports.updateCard = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const { headingId, image, name, description, designation } = req.body;

    const updatedData = await testimonalModel.findByIdAndUpdate(
      req.params.id,
      { headingId, image, name, description, designation },
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



// DELETE SINGLE
exports.singleDeleteCard = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await testimonalModel.findByIdAndDelete(req.params.id);

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



// DELETE SELECTIVE
exports.selectiveDeleteCard = async (req, res) => {
  try {

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: "error",
        message: "Provide array of ids",
      });
    }

    const result = await testimonalModel.deleteMany({
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



// DELETE ALL
exports.multipleDeleteCard = async (req, res) => {
  try {

    const result = await testimonalModel.deleteMany({});

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