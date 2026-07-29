const mongoose = require("mongoose");
const child = require("../../models/ChildrenForm/ChildrenFormModel");
const UserSubscription = require("../../models/SubscriptionPayment/SubscriptionPaymentModel");
const path = require("path");

const Notification = require("../../models/notificationModel");
const Program = require("../../models/Service/ServiceModel");
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


      assignments = assignments.map(item => ({

        ...item,

        assignedAt: new Date()

      }));

    }

    // ✅ IMAGE PATH FROM MULTER
    const profileImage = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        req.file.destination
      )}/${req.file.filename}`
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
    const uniqueCoachIds = [
      ...new Set(
        assignments
          .filter((item) => item.coach)
          .map((item) => item.coach.toString())
      ),
    ];

    for (const coachId of uniqueCoachIds) {
      await Notification.create({
        coachId,
        childId: newChild._id,
        title: "New Child Assigned",
        message: `${newChild.fullName} has been assigned to you.`,
        type: "child_assigned",
      });
    }

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


// exports.getAllChild = async (req, res) => {
//   try {
//     const page =
//       Number(req.query.page) || 1;

//     const limit = 5;

//     const skip =
//       (page - 1) * limit;

//     const totalChildren =
//       await child.countDocuments();

//     const data = await child.find()
//       .populate({
//         path: "programAssignments.program",
//         select: "title",
//       })
//       .populate({
//         path: "programAssignments.coach",
//         select: "fullname email phone location",
//       })
//       .sort({
//         createdAt: -1,
//       })
//       .skip(skip)
//       .limit(limit);

//     return res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalPages: Math.ceil(
//         totalChildren / limit
//       ),
//       totalChildren,
//       results: data.length,
//       data,
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }
// };

exports.getAllChild = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search = "",
      sortBy = "createdAt",
      order = "desc",
      foodHabit,
      allergy,
      prolongDisease,
      minAge,
      maxAge,
      coach,
      program,
    } = req.query;

    const query = {};

    // ===========================
    // SEARCH
    // ===========================

    if (search) {
      query.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ===========================
    // FOOD HABIT
    // ===========================

    if (foodHabit) {
      query.foodHabit = foodHabit;
    }

    // ===========================
    // ALLERGY
    // ===========================

    if (
      allergy !== undefined &&
      allergy !== ""
    ) {
      query.allergy = allergy === "true";
    }

    // ===========================
    // PROLONG DISEASE
    // ===========================

    if (
      prolongDisease &&
      prolongDisease !== ""
    ) {
      query.prolongDisease = prolongDisease;
    }

    // ===========================
    // AGE FILTER
    // ===========================

    if (minAge || maxAge) {
      query.age = {};

      if (minAge) {
        query.age.$gte = Number(minAge);
      }

      if (maxAge) {
        query.age.$lte = Number(maxAge);
      }
    }

    // ===========================
    // PROGRAM FILTER
    // ===========================

    if (program) {
      query["programAssignments.program"] = program;
    }

    // ===========================
    // COACH FILTER
    // ===========================

    if (coach) {
      query["programAssignments.coach"] = coach;
    }

    // ===========================
    // SORT
    // ===========================

    const sortObject = {};

    sortObject[sortBy] =
      order === "asc" ? 1 : -1;
    // ===========================
    // TOTAL CHILDREN
    // ===========================

    const totalChildren = await child.countDocuments(query);

    // ===========================
    // FETCH DATA
    // ===========================

    // let children = await child
    //   .find(query)
    //   .populate({
    //     path: "programAssignments.program",
    //     select: "title image",
    //   })
    //   .populate({
    //     path: "programAssignments.coach",
    //     select: "fullname email phone location",
    //   })
    //   .sort(sortObject)
    //   .skip(skip)
    //   .limit(limit);

    let children = await child
      .find(query)
      .populate({
        path: "programAssignments.program",
        select: "title image",
      })
      .populate({
        path: "programAssignments.coach",
        select: "fullname email phone location",
      })
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    // ===========================
    // PROFILE IMAGE FULL URL
    // ===========================

    children = children.map((item) => {
      const childObj = item.toObject();

      if (childObj.profileImage) {
        childObj.profileImage = childObj.profileImage.startsWith("http")
          ? childObj.profileImage
          : `${req.protocol}://${req.get("host")}${childObj.profileImage}`;
      }

      return childObj;
    });



    // ==========================================
    // SEARCH INSIDE POPULATED PROGRAM / COACH
    // ==========================================

    if (search) {
      const keyword = search.toLowerCase();

      children = children.filter((item) => {
        const programMatch = item.programAssignments.some(
          (assignment) =>
            assignment.program?.title
              ?.toLowerCase()
              .includes(keyword)
        );

        const coachMatch = item.programAssignments.some(
          (assignment) =>
            assignment.coach?.fullname
              ?.toLowerCase()
              .includes(keyword)
        );

        return (
          item.fullName
            ?.toLowerCase()
            .includes(keyword) ||
          item.email
            ?.toLowerCase()
            .includes(keyword) ||
          item.location
            ?.toLowerCase()
            .includes(keyword) ||
          programMatch ||
          coachMatch
        );
      });
    }

    // ===========================
    // RESPONSE
    // ===========================
    console.log("Query:", query);
    console.log("Total Children:", totalChildren);
    console.log("Returned:", children.length);
    return res.status(200).json({
      success: true,

      currentPage: page,

      totalPages: Math.ceil(
        totalChildren / limit
      ),

      totalChildren,

      results: children.length,

      data: children,
    });
  } catch (error) {
    return res.status(500).json({
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


    const existingChild = await child.findById(childId);


    if (!existingChild) {
      return res.status(404).json({
        success: false,
        message: "Child profile not found"
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
      ? `${req.protocol}://${req.get("host")}/uploads/${path.basename(
        req.file.destination
      )}/${req.file.filename}`
      : existingChild.profileImage;



    let assignments =
      existingChild.programAssignments || [];



    if (programAssignments) {

      const newAssignments = JSON.parse(programAssignments);


      assignments = newAssignments.map(item => {


        const oldAssignment =
          existingChild.programAssignments.find(
            old =>
              old.program.toString() === item.program.toString() &&
              old.coach.toString() === item.coach.toString()
          );



        return {

          program: item.program,

          coach: item.coach,


          // old program হলে old time
          // new program হলে new time

          assignedAt:
            oldAssignment?.assignedAt || new Date()

        };


      });


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

      programAssignments: assignments

    };



    // ===============================
    // CREATE COACH NOTIFICATION
    // ===============================


    const oldAssignments =
      existingChild.programAssignments.map(item => ({
        coach: item.coach.toString(),
        program: item.program.toString()
      }));


    for (const item of assignments) {

      const newAssignment = {
        coach: item.coach.toString(),
        program: item.program.toString()
      };


      const alreadyExist =
        oldAssignments.some(old =>
          old.coach === newAssignment.coach &&
          old.program === newAssignment.program
        );


      // নতুন program + coach assignment হলে notification

      if (!alreadyExist) {

        const program =
          await Program.findById(item.program);


        await Notification.create({

          coachId: item.coach,

          childId: existingChild._id,

          programId: item.program,

          title: "New Program Assigned",

          message:
            `${existingChild.fullName} has been assigned ${program?.title || "a new program"}.`,

          type: "program_assigned"

        });

      }

    }



    const updatedChild =
      await child.findByIdAndUpdate(
        childId,
        updatedData,
        { new: true }
      )
        .populate({
          path: "programAssignments.program",
          select: "title image"
        })
        .populate({
          path: "programAssignments.coach",
          select: "fullname email phone location"
        });



    return res.status(200).json({

      success: true,

      message: "Child profile updated successfully",

      data: updatedChild

    });



  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

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