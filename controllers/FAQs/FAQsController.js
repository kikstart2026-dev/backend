const mongoose = require("mongoose");
const Faq = require("../../models/FAQs/FAQsModel");


// CREATE FAQ
exports.createFaq = async (req, res) => {
  try {

    const faq = await Faq.create(req.body);

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL FAQ
exports.getFaqs = async (req, res) => {
  try {

    const faqs = await Faq.aggregate([
      {
        $lookup: {
          from: "headings",
          localField: "headingId",
          foreignField: "_id",
          as: "headingData"
        }
      },
      {  $unwind: {
          path: "$headingData",
          preserveNullAndEmptyArrays: true
        } },

      // {
      //   $sort: { createdAt: -1 }
      // },

      {
        $project: {
          question: 1,
          answer: 1,
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
      data: faqs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET SINGLE FAQ
exports.getSingleFaq = async (req, res) => {
  try {

    const mongoId = req.params.id;

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


// UPDATE FAQ
exports.updateFaq = async (req, res) => {
  try {

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


// DELETE FAQ
exports.deleteFaq = async (req, res) => {
  try {

    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};