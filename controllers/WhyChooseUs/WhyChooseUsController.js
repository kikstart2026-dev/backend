const mongoose = require("mongoose");
const WhyChooseUsCardModel = require("../../models/WhyChooseUs/WhyChooseUsModel");


// CREATE
exports.createCard = async (req, res) => {
  try {
    const { headingId, icon, title, description, color } = req.body;

    if (!headingId) {
      return res.status(400).json({
        status: "error",
        message: "headingId is required",
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
      icon,
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


// GET ALL (Aggregate)
exports.getAllCards = async (req, res) => {
  try {
    // pagination params
    const page = Number(req.query.page) || 1;
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const skip = limit ? (page - 1) * limit : 0;

    // total count (without aggregation)
    const totalData = await WhyChooseUsCardModel.aggregate([
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData",
        },
      },
      { $unwind: "$headingData" },
      { $count: "total" },
    ]);

    const totalCards = totalData[0]?.total || 0;

const data = await WhyChooseUsCardModel.aggregate([
  { $lookup: { from: "headings", localField: "headingId", foreignField: "_id", as: "headingData" }},
  { $unwind: "$headingData" },
  { $sort: { createdAt: 1 } },

  ...(limit ? [{ $skip: skip }, { $limit: limit }] : []),

      {
        $project: {
          icon: 1,
          title: 1,
          description: 1,
          color: 1,
          headingData: {
            _id: "$headingData._id",
            tagline: "$headingData.tagline",
            heading: "$headingData.heading",
            description: "$headingData.description",
          },
        },
      },
    ]);

    // Extract Heading (same as before)
    const heading = data.length ? data[0].headingData : null;

    // Cards clean
    const cards = data.map((item) => ({
      _id: item._id,
      icon: item.icon,
      title: item.title,
      description: item.description,
      color: item.color,
    }));

    res.status(200).json({
      status: "success",
      message: "Why Choose Us fetched successfully",

      // pagination info 👇
      totalCards,
      currentPage: page,
      totalPages: Math.ceil(totalCards / limit),
      cardsOnThisPage: cards.length,

      data: {
        heading,
        cards,
      },
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

//  GET BY ID
exports.getCardById = async (req, res) => {
  try {
    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

    const data = await WhyChooseUsCardModel.aggregate([
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
          icon: 1,
          title: 1,
          description: 1,
          color: 1,
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

    const { headingId, icon, title, description, color } = req.body;

    // ✅ SAFE UPDATE OBJECT
    const updateData = {};

    if (headingId) updateData.headingId = headingId;
    if (icon) updateData.icon = icon;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (color) updateData.color = color;

    const updatedData = await WhyChooseUsCardModel.findByIdAndUpdate(
      req.params.id,
      updateData, // ✅ only valid fields
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


//  DELETE SINGLE
exports.singleDeleteCard = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid ID format",
      });
    }

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

//  DELETE SELECTIVE
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

//  DELETE ALL
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