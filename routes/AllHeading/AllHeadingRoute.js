const express = require("express");
const router = express.Router();

const headingController = require("../../controllers/AllHeading/AllHeadingController");

// Create Heading
router.post("/create", headingController.createHead);

// Get All Headings
router.get("/", headingController.getAll);

// Get Single Heading By ID
router.get("/:id", headingController.getById);

// Update Heading
router.put("/:id", headingController.update);

// Delete Single Heading
router.delete("/:id", headingController.singleDelete);

// Delete Selected Headings
router.post("/selective-delete", headingController.selectiveDelete);

// Delete All Headings
router.post("/delete-all", headingController.MultipleDelete); 

module.exports = router;


// deleteMany function doesn't support .delete method its need .post 