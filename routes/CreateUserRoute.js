const express = require("express");
const router = express.Router();

const {
  createSubAdmin,
  getAllSubAdmins,
  getSubAdminById,
  // updateSubAdmin,
  deleteSubAdmin,
  assignDynamicRole,
  exportSubAdminsCSV,
} = require("../controllers/CreateUserController");

const { protect, adminOnly } = require("../middleware/adminMiddleware");

// 🔥 ALL ROUTES ADMIN ONLY

router.post("/emp", protect, adminOnly, createSubAdmin);
router.get("/emp", protect, adminOnly, getAllSubAdmins);
router.get("/emp/export-csv", protect,adminOnly,exportSubAdminsCSV);
router.get("/emp/:id", protect, adminOnly, getSubAdminById);
// router.put("/emp/:id", protect, adminOnly, updateSubAdmin);
router.delete("/emp/:id", protect, adminOnly, deleteSubAdmin);
router.put("/emp/assign-role/:id", protect, adminOnly, assignDynamicRole);

module.exports = router;