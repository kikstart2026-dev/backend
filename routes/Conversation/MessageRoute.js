const express = require("express");

const router = express.Router();

const controller = require("../../controllers/Conversation/MessageController");

router.post(
  "/send",
  controller.sendMessage
);

router.get(
  "/:conversationSid",
  controller.getMessages
);

// mark as read
router.post("/mark-read", controller.markAsRead);

module.exports = router;