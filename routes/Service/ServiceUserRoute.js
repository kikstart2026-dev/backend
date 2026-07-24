const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Service/ServiceController");

// ==========================
// ✅ GET ALL
// ==========================
router.get("/", controller.getAllService);


// ==========================
// ✅ GET BY ID
// ==========================
router.get("/:id", controller.getServiceById);

module.exports = router;