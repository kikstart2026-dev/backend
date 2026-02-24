const express = require("express");
const router = express.Router();

const enqController = require("../../controllers/EnquiryForm/enquiryController");

router.post("/createEnq", enqController.createEnq);

module.exports = router;