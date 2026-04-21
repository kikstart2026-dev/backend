const express = require("express");
const router = express.Router();

const {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../controllers/ModulesController");

const { protect, adminOnly } = require("../middleware/adminMiddleware");

router.post("/module", protect, adminOnly, createModule);
router.get("/module", protect, adminOnly, getModules);
router.get("/module/:id", protect, adminOnly, getModuleById);
router.put("/module/:id", protect, adminOnly, updateModule);
router.delete("/module/:id", protect, adminOnly, deleteModule);

module.exports = router;