const mongoose = require("mongoose");
const child = require("../../models/ChildrenForm/ChildrenFormModel");
const UserSubscription = require("../../models/SubscriptionPayment/SubscriptionPaymentModel");
const path = require("path");



exports.createChild = async (req, res) => {
  try {

    const {
      fullName,
      email,
      location,
      age,
      passCode,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
    } = req.body;

    // ✅ IMAGE PATH FROM MULTER
    const profileImage = req.file
      ? `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`
      : "";

    // ================= REQUIRED FIELD CHECK =================

    if (!fullName || !email || !location || !age || !passCode) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // ================= ACTIVE SUBSCRIPTION CHECK =================

    const activePlan = await UserSubscription.findOne({
      email,
      status: "captured",
    })
      .sort({
        createdAt: -1,
      })
      .populate("subscriptionId");

    if (!activePlan) {
      return res.status(403).json({
        success: false,
        redirectToSubscription: true,
        message: "No active subscription found",
      });
    }

    // ================= SUBSCRIPTION EXPIRY CHECK =================

    if (
      activePlan.expireDate &&
      new Date(activePlan.expireDate) < new Date()
    ) {
      return res.status(403).json({
        success: false,
        redirectToSubscription: true,
        message: "Subscription expired. Please renew your plan.",
      });
    }

    // ================= CHILD LIMIT CHECK =================

    const totalChildren = await child.countDocuments({
      email,
    });

    const allowedChildren =
      activePlan.subscriptionId?.maxChildren || 0;

    if (totalChildren >= allowedChildren) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        maxChildren: allowedChildren,
        currentChildren: totalChildren,
        message: `Maximum ${allowedChildren} children allowed in your subscription plan`,
      });
    }

    // ================= CREATE CHILD =================

    const newChild = await child.create({
      fullName,
      email,
      location,
      age,
      passCode,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      profileImage,
    });

    return res.status(201).json({
      success: true,
      message: "Child profile created successfully",
      data: newChild,
      remainingChildren:
        allowedChildren - (totalChildren + 1),
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



exports.getAllChild = async (req, res) => {
  try {

    const data = await child.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      results: data.length,
      data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};




exports.getChildById = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    const data = await child.findById(childId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};




exports.updateChild = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    const existingChild = await child.findById(childId);

    if (!existingChild) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
      });
    }

    const {
      fullName,
      email,
      age,
      location,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      // profileImage,
    } = req.body;

     // ✅ IMAGE FIX (multer)
    const imagePath = req.file
  ? `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`
  : existingChild.profileImage;

    const updatedData = {
      fullName,
      email,
      age,
      location,
      foodHabit,
      allergy,
      allergyDetails,
      prolongDisease,
      profileImage: imagePath,

      // // ✅ new image na hole old image thakbe
      // profileImage:
      //   profileImage || existingChild.profileImage,
    };

    const updatedChild = await child.findByIdAndUpdate(
      childId,
      updatedData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Child profile updated successfully",
      data: updatedChild,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



exports.deleteChild = async (req, res) => {
  try {

    const childId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid child id",
      });
    }

    const deletedChild = await child.findByIdAndDelete(
      childId
    );

    if (!deletedChild) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Child profile deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
exports.deleteAllChild = async (req, res) => {
  try {

    const result = await child.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All child profiles deleted successfully",
      deleteCount: result.deletedCount,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};