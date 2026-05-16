const express = require("express");
const router = express.Router();

const { getUsers, deleteUser, getChatUsers } = require("../../controllers/User/UserController");


const { protect } = require("../../middleware/adminMiddleware");
const checkPermission = require("../../middleware/permissionMiddleware");


// ================= GET ALL USERS =================
router.get(
  "/",
  protect,
  checkPermission("User Control", "read"),
  getUsers
);

// ================= DELETE USER =================
router.delete(
  "/:id",
  protect,
  checkPermission("User Control", "delete"),
  deleteUser
);


// CHAT USERS (for messaging system) 
router.get("/chat-users",
  getChatUsers);

module.exports = router;