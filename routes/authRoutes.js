const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); // ✅ ADD THIS

const authController = require("../controllers/authController");

// ✅ Signup with Image Upload
router.post("/signup", upload.single("image"), authController.signUp);

router.post("/verify-otp", authController.otpVerify);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resendotp", authController.resendOtp);

router.post("/google", authController.googleAuth);

module.exports = router;