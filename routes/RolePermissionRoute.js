const express = require("express");
const router = express.Router();

const {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} = require("../controllers/RolePermissionController");

const { protect, adminOnly } = require("../middleware/adminMiddleware");

router.post("/permission", protect, adminOnly, createPermission);
router.get("/permission", protect, adminOnly, getPermissions);
router.get("/permission/:id", protect, adminOnly, getPermissionById);
router.put("/permission/:id", protect, adminOnly, updatePermission);
router.delete("/permission/:id", protect, adminOnly, deletePermission);

module.exports = router;