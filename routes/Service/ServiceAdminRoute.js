const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Service/ServiceController");

// ==========================
// ✅ CREATE
// ==========================
router.post("/create", controller.createService);


// ==========================
// ✅ GET ALL
// ==========================
router.get("/", controller.getAllService);


// ==========================
// ✅ GET BY ID
// ==========================
router.get("/:id", controller.getServiceById);


// ==========================
// ✅ UPDATE
// ==========================
router.put("/:id", controller.updateService);


// ==========================
// ✅ DELETE SELECTIVE
// ==========================
router.delete("/select/delete", controller.selectiveDeleteService);


// ==========================
// ✅ DELETE ALL
// ==========================
router.delete("/delete/all", controller.multipleDeleteService);


// ==========================
// ✅ DELETE SINGLE
// ==========================
router.delete("/:id", controller.singleDeleteService);


module.exports = router;