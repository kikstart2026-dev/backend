const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const adminController = require("../controllers/adminAuthController");
const { protect, adminOnly } = require("../middleware/adminMiddleware");

// ✅ Admin can view users
router.get("/users", protect, adminOnly, adminController.getAllUsers);

// ✅ Get single user
router.get("/user/:id", protect, adminOnly, adminController.getUserById);

// 🔥 Request update (NEW SYSTEM)
router.post(
  "/user/:id/request-update",
  protect,
  adminOnly,
  upload.single("image"),
  adminController.requestUpdateUser
);

// ✅ Approve / Reject (email links)
router.get("/approve/:token", adminController.approveUpdate);
router.get("/reject/:token", adminController.rejectUpdate);

// ✅ Delete
router.delete("/user/:id", protect, adminOnly, adminController.deleteSingleUser);

router.delete("/users/delete-multiple", protect, adminOnly, adminController.deleteMultipleUsers);

router.delete("/users/delete-all", protect, adminOnly, adminController.deleteAllUsers);


router.post("/login", adminController.adminLogin);
router.post("/verify-otp", adminController.adminOtpVerify);
router.post("/resend-otp", adminController.adminResendOtp);
router.post("/forgot-password", adminController.adminForgotPassword);
router.post("/reset-password", adminController.adminResetPassword);
router.post("/logout", adminController.adminLogout);

module.exports = router;