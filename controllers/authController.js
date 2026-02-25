const User = require("../models/authModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../middleware/sendMail");

const jwtSecret = process.env.TOKEN_SECRET;

// ================= TOKEN =================
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });
};

// ================= OTP GENERATOR =================
const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); //4 digit code
  const expiry = Date.now() + 30 * 1000; //30 sec valid
  return { otp, expiry };
};

// ================= EMAIL TEMPLATE =================
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



// =================================================
// ================= SIGNUP ========================
// =================================================
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

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(409).json({ message: "Email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpData = generateOtp();

    await User.create({
      fullname,
      email: email.trim().toLowerCase(),  // ✅ FIX
      phone,
      location,
      passcode,
      password: hashedPassword,
      otp: otpData.otp,
      otpExpiry: otpData.expiry,
      isVerified: false,
    });

    await sendMail(
      email,
      "🔐 Verify Your KikStart Account",
      emailTemplate(
        "Account Verification",
        `<p>Hey <b>${fullname}</b>,</p>
         <p>Your OTP is:</p>
         <h1 style="letter-spacing:4px;">${otpData.otp}</h1>
         <p>Valid for 30 sec ⏳</p>`
      )
    );

    res.status(201).json({
      message: "Account created. OTP sent to email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// =================================================
// ================= OTP VERIFY ====================
// =================================================
exports.otpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({  email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== Number(otp) || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    await sendMail(
      user.email,
      "🎉 Welcome to KikStart!",
      emailTemplate(
        "You're Officially In 🚀",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>Your account has been successfully verified.</p>
         <p>Welcome to KikStart 💙</p>`
      )
    );

    res.status(200).json({ message: "Account verified successfully" });
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
    await sendMail(
      user.email,
      "🔐 Verify Your KikStart Account",
      emailTemplate(
        "Account Verification",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>Your new OTP is:</p>
         <h1 style="letter-spacing:4px;">${otpData.otp}</h1>
         <p>Valid for 30 sec ⏳</p>`
      )
    );

    res.status(200).json({
      message: "New OTP sent successfully",
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
    const { email, phone, password } = req.body;

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
    }

    else {
      return res.status(400).json({
        message: "Email or phone is required",
      });
    }

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Please verify your account first" });

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword)
      return res.status(401).json({ message: "Incorrect password" });

    // 🔥 Generate OTP using existing function
    const otpData = generateOtp();

    user.otp = otpData.otp;
    user.otpExpiry = otpData.expiry;
    await user.save();

    // 🔥 Send OTP Mail
    await sendMail(
      user.email,
      "🔐 Login OTP - KikStart",
      emailTemplate(
        "Login Verification",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>Your Login OTP is:</p>
         <h1 style="letter-spacing:4px;">${otpData.otp}</h1>
         <p>Valid for 30 sec ⏳</p>`
      )
    );

    res.status(200).json({
      message: "Login OTP sent to your email",
      requiresOtp: true,
      email: user.email,
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
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
         <p>Come back soon — something exciting is waiting 🚀</p>`
      )
    );

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

    await sendMail(
      user.email,
      "🔐 Reset Your KikStart Password",
      emailTemplate(
        "Password Reset OTP",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <h1>${otpData.otp}</h1>
         <p>Valid for 30 seconds ⏳</p>`
      )
    );

    res.status(200).json({ message: "OTP sent to email" });
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
        message: "You should give your confirm pass as similar to your password !",
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

    await sendMail(
      user.email,
      "✅ Password Changed Successfully",
      emailTemplate(
        "You're All Set 🔐",
        `<p>Hey <b>${user.fullname}</b>,</p>
         <p>Your password has been successfully updated.</p>`
      )
    );

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

