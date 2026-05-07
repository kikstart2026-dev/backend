const axios = require("axios");
const { google } = require("googleapis");

const User = require("../models/authModel");
const UpdateRequest = require("../models/updateRequestModel");
const crypto = require("crypto");
const { sendMail } = require("../middleware/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.TOKEN_SECRET;

// 🔥 GOOGLE CONFIG
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

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



// =================================================
// ================= ADMIN LOGIN ====================
// =================================================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

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



// =================================================
// ================= OTP VERIFY =====================
// =================================================
exports.adminOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

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
    user.isVerified = true;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        location: user.location,
        passcode: user.passcode,
        image: user.image,
        role: user.role,
        dynamicRole: user.dynamicRole,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= RESEND OTP =====================
// =================================================
exports.adminResendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

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

    res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= FORGOT PASSWORD ================
// =================================================
exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

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

    res.status(200).json({
      message: "OTP sent to email",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= RESET PASSWORD =================
// =================================================
exports.adminResetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmpass } = req.body;

    if (password !== confirmpass) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

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



// =================================================
// ================= ADMIN GOOGLE LOGIN 🔥 =========
// =================================================
exports.adminGoogleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Google code is required",
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const { email, name, picture } = userRes.data;

    if (!email) {
      return res.status(400).json({
        message: "Google email not found",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["admin", "subadmin"] },  // ✅ correct
    });

    if (!user) {
      return res.status(403).json({
        message: "Access denied. Admin only ❌",
      });
    }

    // optional image update
    if (!user.image) {
      user.image = picture || null;
      await user.save();
    }

    const token = generateToken(user);

    await sendMail(
      user.email,
      "Admin Login via Google",
      emailTemplate(
        "Admin Login Successful",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>You logged in via Google successfully.</p>`
      )
    );

    res.status(200).json({
      message: "Admin Google login successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        image: user.image || null,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};



// =================================================
// ================= LOGOUT =========================
// =================================================
exports.adminLogout = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ Update fields as requested
    user.isVerified = false;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    await sendMail(
      user.email,
      "We’ll Miss You Already 💛 | KikStart",
      emailTemplate(
        "See You Again Soon 👋",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>You’ve successfully logged out.</p>
         <p>Come back soon — something exciting is waiting 🚀</p>`,
      ),
    );

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =================================================
// ================= REQUEST UPDATE =================
// =================================================
exports.requestUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

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
        <a href="${approveLink}">✅ Approve</a><br/>
        <a href="${rejectLink}">❌ Reject</a>
      `
    );

    res.status(200).json({
      message: "Update request sent to user",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= APPROVE ========================
// =================================================
exports.approveUpdate = async (req, res) => {
  try {
    const request = await UpdateRequest.findOne({ token: req.params.token });

    if (!request) return res.status(404).send("Invalid request");

    if (request.status !== "pending") return res.send("Already processed");

    if (request.expiresAt < Date.now()) {
      return res.status(400).send("Request expired");
    }

    const user = await User.findById(request.userId);

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



// =================================================
// ================= REJECT =========================
// =================================================
exports.rejectUpdate = async (req, res) => {
  try {
    const request = await UpdateRequest.findOne({ token: req.params.token });

    if (!request) return res.status(404).send("Invalid request");

    if (request.status !== "pending") return res.send("Already processed");

    request.status = "rejected";
    await request.save();

    res.send("❌ Request rejected");

  } catch (error) {
    res.status(500).send(error.message);
  }
};



// =================================================
// ================= USERS ==========================
// =================================================
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

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= DELETE =========================
// =================================================
exports.deleteSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMultipleUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

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

exports.deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({});

    res.status(200).json({
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};