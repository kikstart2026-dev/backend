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

router.post("/mark-seen", controller.markMessagesAsSeen);
module.exports = router;