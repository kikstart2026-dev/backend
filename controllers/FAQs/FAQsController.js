const mongoose = require("mongoose");
const Faq = require("../../models/FAQs/FAQsModel");


// ==========================
// ✅ CREATE FAQ (AUTO ACTIVE)
// ==========================
exports.createFaq = async (req, res) => {
  try {

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is missing",
      });
    }

    const faq = await Faq.create({
      ...req.body,
      isActive: true   // ✅ auto active
    });

    res.status(201).json({
      success: true,
      message: "FAQ created & activated successfully",
      data: faq
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ GET ALL FAQ
// ==========================
exports.getFaqs = async (req, res) => {
  try {

    // ✅ QUERY PARAMS
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    // ✅ NEW: ACTIVE FILTER
    const onlyActive = req.query.active === "true";
    const matchStage = onlyActive ? { isActive: true } : {};

    // ✅ TOTAL COUNT (WITH FILTER)
    const total = await Faq.countDocuments(matchStage);

    // ✅ MAIN DATA
    const faqs = await Faq.aggregate([
      {
        $match: matchStage   // ✅ ADD THIS (important)
      },
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData"
        }
      },
      {
        $unwind: {
          path: "$headingData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          question: 1,
          answer: 1,
          isActive: 1,
          createdAt: 1,
          headingData: {
            _id: "$headingData._id",
            tagline: "$headingData.tagline",
            heading: "$headingData.heading",
            description: "$headingData.description",
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: faqs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ GET SINGLE FAQ
// ==========================
exports.getSingleFaq = async (req, res) => {
  try {

    const mongoId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mongoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const faq = await Faq.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(mongoId)
        }
      },
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData"
        }
      },
      {
        $unwind: {
          path: "$headingData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          question: 1,
          answer: 1,
          isActive: 1,
          createdAt: 1,
          headingData: {
            _id: "$headingData._id",
            tagline: "$headingData.tagline",
            heading: "$headingData.heading",
            description: "$headingData.description",
          }
        }
      }
    ]);

    if (!faq.length) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    res.status(200).json({
      success: true,
      data: faq[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ UPDATE FAQ
// ==========================
exports.updateFaq = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: faq
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ TOGGLE ACTIVE (INDIVIDUAL)
// ==========================
exports.toggleActiveFaq = async (req, res) => {
  try {

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const faq = await Faq.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    faq.isActive = !faq.isActive; // ✅ only this one toggle
    await faq.save();

    res.status(200).json({
      success: true,
      message: "FAQ status updated",
      data: faq,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ DELETE SINGLE FAQ
// ==========================
exports.deleteFaq = async (req, res) => {
  try {

    const deleted = await Faq.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    // check active exists
    const activeExists = await Faq.findOne({ isActive: true });

    if (!activeExists) {
      const latest = await Faq.findOne().sort({ createdAt: -1 });

      if (latest) {
        await Faq.findByIdAndUpdate(latest._id, {
          isActive: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ SELECTIVE DELETE FAQ
// ==========================
exports.selectiveDeleteFaq = async (req, res) => {
  try {

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "Provide array of ids",
      });
    }

    const result = await Faq.deleteMany({
      _id: { $in: ids },
    });

    const activeExists = await Faq.findOne({ isActive: true });

    if (!activeExists) {
      const latest = await Faq.findOne().sort({ createdAt: -1 });

      if (latest) {
        await Faq.findByIdAndUpdate(latest._id, {
          isActive: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Selected FAQs deleted",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ==========================
// ✅ DELETE ALL FAQ
// ==========================
exports.multipleDeleteFaq = async (req, res) => {
  try {

    const result = await Faq.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All FAQs deleted",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};