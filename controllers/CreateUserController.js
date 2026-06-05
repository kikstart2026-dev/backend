const User = require("../models/authModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../middleware/sendMail");

const exportCSV =
  require("../utils/exportCSV");

const generatePassword = (length = 10) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

const emailTemplate = (title, content) => {
  return `
  <div style="font-family: Arial; background:#f4f6f9; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px;">
      <h2 style="color:#4f46e5;">${title}</h2>
      ${content}
      <hr style="margin:30px 0"/>
      <p style="font-size:14px; color:gray;">
        Made with 💙 by Team KikStart
      </p>
    </div>
  </div>
  `;
};

exports.createSubAdmin = async (req, res) => {
  try {
    const { fullname, email } = req.body;

    // 🔥 auto generate password
    const password = generatePassword(10);

    // 🔐 hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      role: "subadmin",
    });

    // 📧 send mail (same as before)
    await sendMail(
      email.trim().toLowerCase(),
      "🎉 Welcome to KikStart!",
      emailTemplate(
        "You're Officially In 🚀",
        `<p>Hey <b>${newUser.fullname}</b>,</p>
         <p>Your account has been successfully created.</p>
         <p>Your Kik Password is <b>${password}</b></p>
         <p>Please login and change your password.</p>
         <p>Welcome to KikStart 💙</p>`
      ),
    );

    res.status(201).json({
      success: true,
      message: "Subadmin created successfully",
      data: newUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllSubAdmins = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const search = req.query.search || "";
    const roleFilter = req.query.role || "";

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const skip = (page - 1) * limit;

    const query = {
      role: "subadmin",
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
          dynamicRole: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // FILTER
    if (roleFilter) {

      if (roleFilter === "no-role") {
        query.$or = [
          { dynamicRole: null },
          { dynamicRole: "" },
          { dynamicRole: { $exists: false } },
        ];
      }

      else {
        query.dynamicRole = roleFilter;
      }
    }

    // SORT
    const sort = {};

    sort[sortBy] =
      sortOrder === "asc"
        ? 1
        : -1;

    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSubAdminById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subadmin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.assignDynamicRole = async (req, res) => {
  try {
    const { dynamicRole } = req.body;

    // ❌ Validation
    if (!dynamicRole) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    // 🔍 Find user first
    const user = await User.findOne({
      _id: req.params.id,
      role: "subadmin",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found",
      });
    }

    // ⚠️ Check same role kina
    if (user.dynamicRole === dynamicRole) {
      return res.status(400).json({
        success: false,
        message: "User already has this role",
      });
    }

    // 🔄 Update role
    user.dynamicRole = dynamicRole;
    await user.save();

    // 📧 Send mail
    res.status(200).json({
      success: true,
      message: "Dynamic role assigned successfully",
      data: user,
    });

    // background mail
    sendMail(
      user.email.trim().toLowerCase(),
      "🎉 Congratulations! New Role Assigned",
      emailTemplate(
        "You've Got a New Role 🚀",
        `<p>Hey <b>${user.fullname || "User"}</b>,</p>
     <p>Congratulations! 🎉</p>
     <p>You have been assigned a new role: <b>${dynamicRole}</b></p>
     <p>Keep up the great work with KikStart 💙</p>`
      )
    ).catch((err) => console.log(err));

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



exports.exportSubAdminsCSV =
  async (req, res) => {
    try {

      const users =
        await User.find({
          role: "subadmin",
        }).sort({
          createdAt: -1,
        });

      const data =
        users.map((user) => ({
          Name: user.fullname,
          Email: user.email,
          Role:
            user.dynamicRole ||
            "No Role",
          CreatedAt:
            user.createdAt,
        }));

      exportCSV(
        data,
        "sub-admins",
        res
      );

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };