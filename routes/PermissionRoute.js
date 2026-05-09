const express = require("express");
const router = express.Router();

const {
  createPermission,
  updatePermission,
  getAllPermissions,
  getPermissionsByRole,
  deletePermission,
  savePermissions ,
  getModules,
  getSinglePermission
} = require("../controllers/Permission/permissionController");

const { protect, adminOnly } = require("../middleware/adminMiddleware");

// ✅ CREATE
router.post("/permission", protect, adminOnly, createPermission);

// ✅ UPDATE
router.put("/permission/:id", protect, adminOnly, updatePermission);

// get modules
// router.get("/permission/modules", getModules);

// ✅ GET ALL
router.get("/permission", protect, adminOnly, getAllPermissions);

// ✅ GET BY dynamicRole
router.get("/permission/role/:dynamicRole", protect, adminOnly, getPermissionsByRole);

// ✅ DELETE
router.delete("/permission/:id", protect, adminOnly, deletePermission);

// 🔥 BULK SAVE (VERY IMPORTANT)
router.post("/permission/save", protect, adminOnly, savePermissions);



router.post(
  "/permission/single",
  protect,
  // adminOnly,
  getSinglePermission
);





module.exports = router;