const User = require("../models/authModel");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../middleware/sendMail");

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
    const { fullname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      role: "subadmin",
    });

    // ❌ save() lagbe na (create already save kore)
    // await newUser.save();

    await sendMail(
      email.trim().toLowerCase(),
      "🎉 Welcome to KikStart!",
      emailTemplate(
        "You're Officially In 🚀",
        `<p>Hey <b>${newUser.fullname}</b>,</p>
         <p>Your account has been successfully created.</p>
         <p>Your Kik Password is ${password}.</p>
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
    const users = await User.find({ role: "subadmin" });

    res.status(200).json({
      success: true,
      data: users,
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

exports.updateSubAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password both are required",
      });
    }

    // 🔍 Step 1: Find user by email + role
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "subadmin",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Subadmin not found with this email",
      });
    }

    // 🔐 Step 2: Check old password same kina
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.status(400).json({
        success: false,
        message: "Same password not allowed",
      });
    }

    // 🔑 Step 3: Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔄 Step 4: Update password
    user.password = hashedPassword;
    await user.save();

    // 📧 Step 5: Send mail (only if password changed)
    await sendMail(
      email.trim().toLowerCase(),
      "🔐 Password Updated Successfully",
      emailTemplate(
        "Your Password Has Been Changed 🚀",
        `<p>Hey <b>${user.fullname || "User"}</b>,</p>
         <p>Your password has been updated successfully.</p>
         <p><b>New Password:</b> ${password}</p>
         <p>If this wasn't you, contact support immediately.</p>`
      )
    );

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
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
    await sendMail(
      user.email.trim().toLowerCase(),
      "🎉 Congratulations! New Role Assigned",
      emailTemplate(
        "You've Got a New Role 🚀",
        `<p>Hey <b>${user.fullname || "User"}</b>,</p>
         <p>Congratulations! 🎉</p>
         <p>You have been assigned a new role: <b>${dynamicRole}</b></p>
         <p>Keep up the great work with KikStart 💙</p>`
      )
    );

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Dynamic role assigned successfully",
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
