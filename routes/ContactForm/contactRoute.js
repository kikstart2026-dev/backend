const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/ContactForm/contactController");

router.post("/contact", contactController.createContact);

module.exports = router;