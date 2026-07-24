const express = require("express");
const router = express.Router();
const controller = require("../../controllers/Service/ServiceController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");

// ==========================
// ✅ CREATE
// ==========================
router.post("/create",
    protect,
    checkPermission("Service Control", "create"),
    controller.createService);


// ==========================
// ✅ GET ALL
// ==========================
router.get("/",
    protect,
    checkPermission("Service Control", "read"),
    controller.getAllService);


// ==========================
// ✅ GET BY ID
// ==========================
router.get("/:id",
    protect,
    checkPermission("Service Control", "read"),
    controller.getServiceById);


// ==========================
// ✅ UPDATE
// ==========================
router.put("/:id",
    protect,
    checkPermission("Service Control", "update"),
    controller.updateService);


// ==========================
// ✅ DELETE SELECTIVE
// ==========================
router.delete("/select/delete",
    protect,
    checkPermission("Service Control", "delete"),
    controller.selectiveDeleteService);


// ==========================
// ✅ DELETE ALL
// ==========================
router.delete("/delete/all",
    protect,
    checkPermission("Service Control", "delete"),
    controller.multipleDeleteService);


// ==========================
// ✅ DELETE SINGLE
// ==========================
router.delete("/:id",
    protect,
    checkPermission("Service Control", "delete"),
    controller.singleDeleteService);


module.exports = router;