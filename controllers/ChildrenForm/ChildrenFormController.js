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

      programAssignments,

    } = req.body;

    let assignments = [];

    if (programAssignments) {
      assignments = JSON.parse(programAssignments);
    }

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

      programAssignments: assignments,
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
    const page =
      Number(req.query.page) || 1;

    const limit = 5;

    const skip =
      (page - 1) * limit;

    const totalChildren =
      await child.countDocuments();

    const data = await child.find()
      .populate({
        path: "programAssignments.program",
        select: "title",
      })
      .populate({
        path: "programAssignments.coach",
        select: "fullname email phone location",
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(
        totalChildren / limit
      ),
      totalChildren,
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


    const data = await child.findById(childId)
      .populate({
        path: "programAssignments.program",
        select: "title",
      })
      .populate({
        path: "programAssignments.coach",
        select: "fullname email phone location",
      })

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
      programAssignments,
    } = req.body;

    const imagePath = req.file
      ? `/uploads/${path.basename(req.file.destination)}/${req.file.filename}`
      : existingChild.profileImage;

    let assignments =
      existingChild.programAssignments || [];

    if (programAssignments) {
      assignments = JSON.parse(programAssignments);
    }

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

      programAssignments: assignments,
    };

    const updatedChild = await child
      .findByIdAndUpdate(
        childId,
        updatedData,
        { new: true }
      )
      .populate({
        path: "programAssignments.program",
        select: "title",
      })
      .populate({
        path: "programAssignments.coach",
        select:
          "fullname email phone location",
      });

    return res.status(200).json({
      success: true,
      message:
        "Child profile updated successfully",
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


exports.getMyChildren = async (req, res) => {
  try {
    const { email } = req.params;

    const children = await child.find({ email })
      .populate({
        path: "programAssignments.program",
        select: "title",
      })
      .populate({
        path: "programAssignments.coach",
        select: "fullname email phone location",
      })

    res.status(200).json({
      success: true,
      results: children.length,
      data: children,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getCoachChildren = async (req, res) => {
  try {
    const { coachId } = req.params;

    const children = await child
      .find({
        "programAssignments.coach": coachId,
      })
      .populate({
        path: "programAssignments.program",
      })
      .populate({
        path: "programAssignments.coach",
      });


    console.log(
      JSON.stringify(children, null, 2)
    );

    console.log("Coach ID:", coachId);
    console.log("Matched Children:", children);

    // শুধুমাত্র logged-in coach-এর assignments রাখবে
    const filteredChildren = children.map((childData) => {
      const assignments =
        childData.programAssignments.filter(
          (assignment) =>
            assignment.coach &&
            assignment.coach._id.toString() === coachId
        );

      return {
        ...childData.toObject(),
        programAssignments: assignments,
      };
    });

    return res.status(200).json({
      success: true,
      results: filteredChildren.length,
      data: filteredChildren,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};