const axios = require("axios");
const { google } = require("googleapis");

const User = require("../models/authModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const {
//   sendMail,
//   emailTemplate,
// } = require("../middleware/sendMail");

const jwtSecret = process.env.TOKEN_SECRET;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

// ================= TOKEN =================
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// ================= OTP =================
const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = Date.now() + 90 * 1000;
  return { otp, expiry };
};

// ================= SIGNUP =================
exports.signUp = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      location,
      passcode,
      password,
      confirmPass,
      dynamicRole, // 🔥 new
    } = req.body;

    if (
      !fullname ||
      !email ||
      !phone ||
      !location ||
      !passcode ||
      !password ||
      !confirmPass
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    const existingPhoneUser = await User.findOne({ phone });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpData = generateOtp();
    const imagePath = req.file ? req.file.path : null;

    if (
      existingPhoneUser &&
      (!existingEmailUser ||
        existingPhoneUser._id.toString() !==
        existingEmailUser._id.toString())
    ) {
      return res.status(400).json({
        message: "Phone number already used",
      });
    }

    // ===== EXISTING USER =====
    if (existingEmailUser) {
      if (existingEmailUser.isVerified === true) {
        return res.status(400).json({
          message: "User already exists. Please login.",
        });
      }

      existingEmailUser.fullname = fullname;
      existingEmailUser.phone = phone;
      existingEmailUser.location = location;
      existingEmailUser.passcode = passcode;
      existingEmailUser.password = hashedPassword;
      existingEmailUser.image = imagePath;
      existingEmailUser.dynamicRole = dynamicRole || null;
      existingEmailUser.otp = otpData.otp;
      existingEmailUser.otpExpiry = otpData.expiry;

      await existingEmailUser.save();

      // await sendMail(
      //   normalizedEmail,
      //   "Verify Account",
      //   `<h1>${otpData.otp}</h1>`
      // );

      return res.status(200).json({
        message: "Account exists, please verify",
        otp: otpData.otp,
      });
    }

    // ===== NEW USER =====
    await User.create({
      fullname,
      email: normalizedEmail,
      phone,
      location,
      passcode,
      password: hashedPassword,
      image: imagePath,
      otp: otpData.otp,
      otpExpiry: otpData.expiry,
      isVerified: false,
      role: "user",
      dynamicRole: dynamicRole || null,
    });

    // await sendMail(
    //   normalizedEmail,
    //   "Verify Account",
    //   `<h1>${otpData.otp}</h1>`
    // );

    return res.status(201).json({
      message: "Account created successfully",
      otp: otpData.otp, // demo purpose
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= OTP VERIFY =================
exports.otpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Already verified",
      });
    }

    if (!user.otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (user.otp !== Number(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      message: "Verified",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        dynamicRole: user.dynamicRole, // 🔥 important
        location: user.location || null,
        phone: user.phone || null,
        passcode: user.passcode || null,
        image: user.image || null
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================
// ================= RESEND OTP ====================
// =================================================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Account already verified",
      });
    }

    // Generate new OTP
    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    // Send Mail
    // await sendMail(
    //   user.email,
    //   "🔐 Verify Your KikStart Account",
    //   emailTemplate(
    //     "Account Verification",
    //     `<p>Hey <b>${user.fullname}</b>,</p>
    //      <p>Your new OTP is:</p>
    //      <h1 style="letter-spacing:4px;">${otpData.otp}</h1>
    //      <p>Valid for 90 sec ⏳</p>`,
    //   ),
    // );

    res.status(200).json({
      message: "New OTP generated successfully",
      otp: otpData.otp,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =================================================
// ================= LOGIN =========================
// =================================================
exports.login = async (req, res) => {
  try {
    const { email, phone, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let user;

    // If email is provided
    if (email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    // If phone is provided
    else if (phone) {
      user = await User.findOne({ phone: String(phone).trim() });
    } else {
      return res.status(400).json({
        message: "Email or phone is required",
      });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Coach login check
    if (role === "coach" && user.role !== "coach") {
      return res.status(403).json({
        message: "Only coach can login from coach portal.",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Only ${role} can login here.`,
      });
    }

    // if (!user.isVerified) {
    //   return res.status(400).json({
    //     message: "Please verify your account first.",
    //   });
    // }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword)
      return res.status(401).json({ message: "Incorrect password" });

    // 🔥 Generate OTP using existing function
    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    // 🔥 Send OTP Mail
    // await sendMail(
    //   user.email,
    //   "🔐 Login OTP - KikStart",
    //   emailTemplate(
    //     "Login Verification",
    //     `<p>Hey <b>${user.fullname}</b>,</p>
    //      <p>Your Login OTP is:</p>
    //      <h1 style="letter-spacing:4px;">${otpData.otp}</h1>
    //      <p>Valid for 30 sec ⏳</p>`,
    //   ),
    // );

    res.status(200).json({
      message: "Login OTP generated",
      requiresOtp: true,
      email: user.email,
      otp: otpData.otp, // demo only
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================
// ================= LOGOUT ========================
// =================================================
exports.logout = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update fields as requested
    user.isVerified = false;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // await sendMail(
    //   user.email,
    //   "We’ll Miss You Already 💛 | KikStart",
    //   emailTemplate(
    //     "See You Again Soon 👋",
    //     `<p>Hey <b>${user.fullname}</b>,</p>
    //      <p>You’ve successfully logged out.</p>
    //      <p>Come back soon — something exciting is waiting 🚀</p>`,
    //   ),
    // );

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================
// ================= FORGOT PASSWORD ===============
// =================================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    // await sendMail(
    //   user.email,
    //   "🔐 Reset Your KikStart Password",
    //   emailTemplate(
    //     "Password Reset OTP",
    //     `<p>Hey <b>${user.fullname}</b>,</p>
    //      <h1>${otpData.otp}</h1>
    //      <p>Valid for 90 seconds ⏳</p>`,
    //   ),
    // );

    res.status(200).json({
      message: "OTP generated",
      otp: otpData.otp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================================================
// ================= RESET PASSWORD ================
// =================================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmpass } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }
    if (password !== confirmpass) {
      return res.status(400).json({
        message:
          "You should give your confirm pass as similar to your password !",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Clear OTP
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // await sendMail(
    //   user.email,
    //   "✅ Password Changed Successfully",
    //   emailTemplate(
    //     "You're All Set 🔐",
    //     `<p>Hey <b>${user.fullname}</b>,</p>
    //      <p>Your password has been successfully updated.</p>`,
    //   ),
    // );

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// =================================================
// ============== GOOGLE SIGNUP / LOGIN ===========
// =================================================
exports.googleAuth = async (req, res) => {
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
      },
    );

    // 🔥 GOOGLE IMAGE ADD
    const { email, name, picture } = userRes.data;

    if (!email) {
      return res.status(400).json({
        message: "Google email not found",
      });
    }

    let user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      user = await User.create({
        fullname: name,
        email: email.trim().toLowerCase(),
        password: "google-auth",
        isVerified: true,
        image: picture || null, // ✅ IMAGE SAVE
      });

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;

      await user.save();

      // ⭐ MAIL SEND SAFE CHECK
      // if (user.email) {
      //   await sendMail(
      //     user.email,
      //     "🎉 Welcome to KikStart!",
      //     emailTemplate(
      //       "You're Officially In 🚀",
      //       `<p>Hey <b>${user.fullname}</b>,</p>
      //      <p>Your Google account login successful.</p>
      //      <p>Welcome to KikStart 💙</p>`,
      //     ),
      //   );
      // }
    } else {
      // ✅ ALWAYS UPDATE GOOGLE IMAGE
      user.fullname = name || user.fullname;

      user.image = picture || user.image || null;

      await user.save();
    }

    const token = generateToken(user);

    const populatedUser = await user.populate("role");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    // ⭐ MAIL SEND SAFE CHECK
    // if (user.email) {
    //   await sendMail(
    //     user.email,
    //     "🎉 Welcome to KikStart!",
    //     emailTemplate(
    //       "You're Officially In 🚀",
    //       `<p>Hey <b>${user.fullname}</b>,</p>
    //        <p>Your Google account login successful.</p>
    //        <p>Welcome to KikStart 💙</p>`,
    //     ),
    //   );
    // }

    return res.status(200).json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: populatedUser.role.name,
        location: user.location || null,
        phone: user.phone || null,
        passcode: user.passcode || null,
        image: user.image || null,// ✅ RETURN IMAGE
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};


exports.getCoachProfile = async (req, res) => {
  try {
    const coach = await User.findById(req.user._id).populate("programs").select("-password");

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCoachProgramDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const coach = await User.findById(req.user._id)
      .populate("programs")
      .select("-password");

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const program = coach.programs.find(
      (item) => item._id.toString() === id
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.changeCoachPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const coach = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, coach.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    coach.password = await bcrypt.hash(newPassword, 10);

    await coach.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};