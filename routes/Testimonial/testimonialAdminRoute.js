const express = require("express");
const router = express.Router();

const testimonialController = require("../../controllers/Testimonials/testimonialController");

const { protect } = require("../../middleware/adminMiddleware");

const checkPermission = require("../../middleware/permissionMiddleware");


// CREATE
router.post("/create",
    protect,
    checkPermission("Testimonial Control", "create"),
    testimonialController.create);

// GET ALL
router.get("/",
    protect,
    checkPermission("Testimonial Control", "read"),
    testimonialController.getAll);

// GET BY ID
router.get("/:id",
    protect,
    checkPermission("Testimonial Control", "read"),
    testimonialController.getCardById);

// UPDATE
router.put("/update/:id",
    protect,
    checkPermission("Testimonial Control", "update"),
    testimonialController.updateCard);

// DELETE SINGLE
router.delete("/delete/:id",
    protect,
    checkPermission("Testimonial Control", "delete"),
    testimonialController.singleDeleteCard);

// DELETE SELECTIVE
router.delete("/delete-selected",
    protect,
    checkPermission("Testimonial Control", "delete"),
    testimonialController.selectiveDeleteCard);

// DELETE ALL
router.delete("/delete-all",
    protect,
    checkPermission("Testimonial Control", "delete"),
    testimonialController.multipleDeleteCard);

module.exports = router;
