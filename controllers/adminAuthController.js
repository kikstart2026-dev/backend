const User = require("../models/authModel");
const UpdateRequest = require("../models/updateRequestModel");
const crypto = require("crypto");
const { sendMail } = require("../middleware/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.TOKEN_SECRET;

// ================= TOKEN =================
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });
};

// ================= OTP =================
const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = Date.now() + 90 * 1000;
  return { otp, expiry };
};

// ================= EMAIL TEMPLATE =================
const emailTemplate = (title, content) => {
  return `
  <div style="font-family: Arial; padding:20px;">
    <h2>${title}</h2>
    ${content}
    <hr/>
    <p>KikStart 💙</p>
  </div>
  `;
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!user) return res.status(404).json({ message: "Admin not found" });
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendMail(
      user.email,
      "🔐 Admin Login OTP",
      emailTemplate(
        "Admin Login Verification",
        `<h1>${otpData.otp}</h1><p>Valid for 90 sec</p>`
      )
    );

    res.status(200).json({
      message: "OTP sent to admin email",
      email: user.email,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!user) return res.status(404).json({ message: "Admin not found" });

    if (
      user.otp !== Number(otp) ||
      !user.otpExpiry ||
      user.otpExpiry < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminResendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!user) return res.status(404).json({ message: "Admin not found" });

    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendMail(
      user.email,
      "🔐 Resend OTP",
      emailTemplate(
        "New OTP",
        `<h1>${otpData.otp}</h1><p>Valid for 90 sec</p>`
      )
    );

    res.status(200).json({ message: "OTP resent successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!user) return res.status(404).json({ message: "Admin not found" });

    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    await sendMail(
      user.email,
      "🔐 Reset Password OTP",
      emailTemplate(
        "Reset Password",
        `<h1>${otpData.otp}</h1>`
      )
    );

    res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminResetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmpass } = req.body;

    if (password !== confirmpass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!user) return res.status(404).json({ message: "Admin not found" });

    if (
      user.otp !== Number(otp) ||
      !user.otpExpiry ||
      user.otpExpiry < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminLogout = async (req, res) => {
  res.status(200).json({
    message: "Admin logged out successfully",
  });
};

// ================== REQUEST UPDATE ==================
exports.requestUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Handle updates + image
    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.path;
    }

    await UpdateRequest.create({
      userId: user._id,
      requestedChanges: updates,
      token,
    });

    const approveLink = `http://localhost:3000/approve/${token}`;
    const rejectLink = `http://localhost:3000/reject/${token}`;

    await sendMail(
      user.email,
      "Approve Profile Update Request",
      `
        <h2>Profile Update Request</h2>
        <p>Admin requested changes to your account.</p>
        <p>Please choose:</p>
        <a href="${approveLink}" style="color:green;">✅ Approve</a><br/><br/>
        <a href="${rejectLink}" style="color:red;">❌ Reject</a>
        <p>This link will expire in 10 minutes ⏳</p>
      `
    );

    res.status(200).json({
      message: "Update request sent to user",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== APPROVE ==================
exports.approveUpdate = async (req, res) => {
  try {
    const request = await UpdateRequest.findOne({ token: req.params.token });

    if (!request) {
      return res.status(404).send("Invalid request");
    }

    if (request.status !== "pending") {
      return res.send("Already processed");
    }

    // ⏳ Check expiry
    if (request.expiresAt < Date.now()) {
      return res.status(400).send("Request expired");
    }

    const user = await User.findById(request.userId);
    if (!user) return res.status(404).send("User not found");

    // 🔐 SAFE UPDATE ONLY
    const allowedFields = ["fullname", "phone", "location", "image"];

    allowedFields.forEach((field) => {
      if (request.requestedChanges[field]) {
        user[field] = request.requestedChanges[field];
      }
    });

    await user.save();

    request.status = "approved";
    await request.save();

    res.send("✅ Changes applied successfully");

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// ================== REJECT ==================
exports.rejectUpdate = async (req, res) => {
  try {
    const request = await UpdateRequest.findOne({ token: req.params.token });

    if (!request) {
      return res.status(404).send("Invalid request");
    }

    if (request.status !== "pending") {
      return res.send("Already processed");
    }

    request.status = "rejected";
    await request.save();

    res.send("❌ Request rejected");

  } catch (error) {
    res.status(500).send(error.message);
  }
};

// ================== GET ALL USERS ==================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== GET SINGLE USER ==================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================== DELETE SINGLE USER ==================
exports.deleteSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== DELETE MULTIPLE USERS ==================
exports.deleteMultipleUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "Please provide userIds array",
      });
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
    });

    res.status(200).json({
      message: "Selected users deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== DELETE ALL USERS ==================
exports.deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});

    res.status(200).json({
      message: "All users deleted successfully 🚨",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};