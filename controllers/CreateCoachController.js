const User = require("../models/authModel");
const Program = require("../models/Service/ServiceModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../middleware/sendMail");
const exportCSV = require("../utils/exportCSV");
const Notification = require("../models/notificationModel");
const Child = require("../models/ChildrenForm/ChildrenFormModel");

// =========================
// Generate Random Password
// =========================

const generatePassword = (length = 10) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
};

// =========================
// Email Template
// =========================

const emailTemplate = (title, content) => {
  return `
  <div style="font-family:Arial;background:#f4f6f9;padding:30px;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:12px;">
      <h2 style="color:#4f46e5;">${title}</h2>

      ${content}

      <hr style="margin:30px 0"/>

      <p style="font-size:14px;color:gray;">
        Made with 💙 by Team KikStart
      </p>

    </div>
  </div>
  `;
};

// ======================================================
// CREATE COACH
// ======================================================

exports.createCoach = async (req, res) => {
  try {

    const {
      fullname,
      email,
      phone,
      location,
    } = req.body;

    // Validation
    if (
      !fullname ||
      !email ||
      !phone ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Duplicate Check

    const existingUser =
      await User.findOne({
        $or: [
          {
            email: email.trim().toLowerCase(),
          },
          {
            phone,
          },
        ],
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email or phone already exists",
      });
    }

    // Password Generate

    const password =
      generatePassword(10);

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Create Coach

    const coach =
      await User.create({

        fullname,

        email:
          email.trim().toLowerCase(),

        phone,

        location,

        password:
          hashedPassword,

        role: "coach",

      });

    // Send Mail

    await sendMail(

      coach.email,

      "🎉 Welcome to KikStart",

      emailTemplate(

        "Coach Account Created",

        `
        <p>Hello <b>${coach.fullname}</b>,</p>

        <p>Your Coach account has been created successfully.</p>

        <p><b>Email :</b> ${coach.email}</p>

        <p><b>Password :</b> ${password}</p>

        <p>
        Please login and change your password.
        </p>

        `
      )

    );

    res.status(201).json({

      success: true,

      message:
        "Coach created successfully",

      data: coach,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }
};

// ======================================================
// GET ALL COACHES
// ======================================================

exports.getAllCoaches =
  async (req, res) => {

    try {

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 5;

      const search =
        req.query.search || "";

      const sortBy =
        req.query.sortBy || "createdAt";

      const sortOrder =
        req.query.sortOrder || "desc";

      const skip =
        (page - 1) * limit;

      const query = {

        role: "coach",

      };

      // SEARCH

      if (search) {

        query.$or = [

          {
            fullname: {
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
            phone: {
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

      // SORT

      const sort = {};

      sort[sortBy] =
        sortOrder === "asc"
          ? 1
          : -1;

      const coaches =
        await User.find(query)
          .populate("programs")
          .sort(sort)
          .skip(skip)
          .limit(limit);

      const total =
        await User.countDocuments(query);

      res.status(200).json({

        success: true,

        data: coaches,

        total,

        page,

        totalPages:
          Math.ceil(total / limit),

      });

    } catch (err) {

      res.status(500).json({

        success: false,

        message: err.message,

      });

    }

  };

// ======================================================
// GET COACH BY ID
// ======================================================

exports.getCoachById = async (req, res) => {
  try {

    const coach = await User.findOne({
      _id: req.params.id,
      role: "coach",
    }).populate("programs");

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    res.status(200).json({
      success: true,
      data: coach,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ======================================================
// ASSIGN PROGRAMS TO COACH
// ======================================================

exports.assignProgramsToCoach = async (req, res) => {
  try {

    const { id } = req.params;
    const { programIds } = req.body;


    const coach = await User.findOne({
      _id: id,
      role: "coach",
    });


    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }



    // OLD PROGRAMS
    const oldProgramIds = coach.programs.map(
      id => id.toString()
    );



    // UPDATE PROGRAMS
    coach.programs = programIds;

    await coach.save();



    // ONLY NEW PROGRAMS
    const newProgramIds = programIds.filter(
      id => !oldProgramIds.includes(id.toString())
    );



    // NO NEW PROGRAM - NO NOTIFICATION
    if (newProgramIds.length > 0) {


      const programs = await Program.find({
        _id: {
          $in: newProgramIds
        }
      });



      for (const program of programs) {


        await Notification.create({

          coachId: coach._id,

          childId: null,

          programId: program._id,


          title: "Program Assigned",


          message:
            `${program.title} has been assigned to you.`,


          type: "program_assigned"

        });


      }

    }



    res.status(200).json({

      success: true,

      message: "Programs assigned successfully",

      data: coach

    });



  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }
};






// ======================================================
// UPDATE COACH
// ======================================================

exports.updateCoach = async (req, res) => {
  try {

    const {
      fullname,
      email,
      phone,
      location,
    } = req.body;

    const coach = await User.findOne({
      _id: req.params.id,
      role: "coach",
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    // Duplicate Email
    if (email && email !== coach.email) {

      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: coach._id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Duplicate Phone
    if (phone && phone !== coach.phone) {

      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: coach._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone already exists",
        });
      }
    }

    coach.fullname = fullname || coach.fullname;
    coach.email = email
      ? email.trim().toLowerCase()
      : coach.email;

    coach.phone = phone || coach.phone;
    coach.location = location || coach.location;

    await coach.save();

    res.status(200).json({
      success: true,
      message: "Coach updated successfully",
      data: coach,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ======================================================
// DELETE COACH
// ======================================================

exports.deleteCoach = async (req, res) => {
  try {

    const coach = await User.findOneAndDelete({
      _id: req.params.id,
      role: "coach",
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coach deleted successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};



// ======================================================
// GET CHILDREN OF A COACH
// ======================================================

exports.getCoachChildren = async (req, res) => {
  try {

    const { id } = req.params;

    const coach = await User.findOne({
      _id: id,
      role: "coach",
    });

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const children = await Child.find({
      coach: id,
    })
      .populate({
        path: "coach",
        select: "fullname email phone location image",
      })
      .populate({
        path: "program",
        select: "title image",
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      results: children.length,
      data: children,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// ======================================================
// EXPORT COACH CSV
// ======================================================

exports.exportCoachesCSV = async (req, res) => {
  try {

    const coaches = await User.find({
      role: "coach",
    }).sort({
      createdAt: -1,
    });

    const data = coaches.map((coach) => ({
      Name: coach.fullname,
      Email: coach.email,
      Phone: coach.phone || "-",
      Location: coach.location || "-",
      CreatedAt: coach.createdAt,
    }));

    exportCSV(
      data,
      "coaches",
      res
    );

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

//=======================================================
//COACH DASHBOARD
//=======================================================

exports.getCoachDashboard = async (req, res) => {
  try {


    const coachId = req.user._id;
    console.log("COACH ID =>", coachId);


    // Coach info + programs
    const coach = await User.findById(coachId)
      .select("-password")
      .populate("programs");


    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found"
      });
    }


    // Children under this coach
    const children = await Child.find({
      "programAssignments.coach": coachId
    })
      .populate({
        path: "programAssignments.program",
        select: "title image"
      })
      .populate({
        path: "programAssignments.coach",
        select: "fullname email phone location"
      })
      .select(
        "fullName age profileImage programAssignments"
      );

// ================= RECENT ACTIVITY =================


const lastChild = await Child.findOne({
  "programAssignments.coach": coachId
})
.sort({
  createdAt: -1
})
.select("fullName createdAt");


const lastUpdatedProgram = await Program.findOne({
  _id: {
    $in: coach.programs
  }
})
.sort({
  updatedAt: -1
})
.select("title updatedAt");



const activities = [];



if(lastChild){

  activities.push({

    title: `${lastChild.fullName} assigned to you`,

    time: lastChild.createdAt

  });

}



if(lastUpdatedProgram){

  activities.push({

    title: `${lastUpdatedProgram.title} program updated`,

    time: lastUpdatedProgram.updatedAt

  });

}

    return res.status(200).json({

      success: true,


      coach: {
        fullname: coach.fullname,
        email: coach.email,
        phone: coach.phone,
        location: coach.location,
        image: coach.image
      },


      stats: {

        totalChildren: children.length,

        totalPrograms: coach.programs.length,

        upcomingSessions: 0,

        messages: 0

      },


      programs: coach.programs,


      children: children,


      activities: activities,

    });



  } catch (error) {

    //  console.log("COACH DASHBOARD ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};