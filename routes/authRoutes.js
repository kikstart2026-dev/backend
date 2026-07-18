const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware"); // ✅ ADD THIS
const authMiddleware = require("../middleware/authMiddleware");
const coachMiddleware = require("../middleware/coachMiddleware");
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


// Coach APIs
router.get(
  "/coach/profile",
  authMiddleware,
  coachMiddleware,
  authController.getCoachProfile
);

router.put(
  "/coach/change-password",
  authMiddleware,
  coachMiddleware,
  authController.changeCoachPassword
);

module.exports = router;