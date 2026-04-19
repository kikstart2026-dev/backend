const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const { createRole, getRoles, updateRole, deleteRole } = require("../../controllers/Role/RoleController");
// RoleRoute.js file-e
const checkPermission = require("../../middleware/permissionMiddleware"); // Import korun

router.post("/", auth, checkPermission("create"), createRole);
router.get("/", auth, checkPermission("read"), getRoles);
router.put("/:id", auth, checkPermission("update"), updateRole);
router.delete("/:id", auth, checkPermission("delete"), deleteRole);

module.exports = router;