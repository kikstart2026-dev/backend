const router = require("express").Router();
const auth = require("../../middleware/authMiddleware");
const checkPermission = require("../../middleware/permissionMiddleware");
const { getUsers, deleteUser } = require("../../controllers/User/UserController");

router.get("/", checkPermission("read"), getUsers);
router.delete("/:id",  checkPermission("delete"), deleteUser);

module.exports = router;