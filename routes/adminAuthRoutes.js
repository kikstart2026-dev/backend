const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const adminController = require("../controllers/adminAuthController");
const { protect, adminOnly, superAdminOnly } = require("../middleware/adminMiddleware");

// ✅ Both admin & superadmin can view users
router.get("/users", protect, adminOnly, adminController.getAllUsers);

// ✅ Get single user by ID
router.get("/user/:id", protect, adminOnly, adminController.getUserById);

// 🔥 Only SuperAdmin can update
router.put(
  "/user/:id",
  protect,
  superAdminOnly,
  upload.single("image"),
  adminController.updateUserByAdmin
);

// 🔥 Only SuperAdmin can delete single
router.delete("/user/:id", protect, superAdminOnly, adminController.deleteSingleUser);

// 🔥 Only SuperAdmin can delete multiple
router.delete("/users/delete-multiple", protect, superAdminOnly, adminController.deleteMultipleUsers);

// 🔥 Only SuperAdmin can delete all
router.delete("/users/delete-all", protect, superAdminOnly, adminController.deleteAllUsers);

module.exports = router;