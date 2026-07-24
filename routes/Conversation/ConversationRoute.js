const express = require("express");

const router = express.Router();

const controller = require("../../controllers/Conversation/ConversationController");

router.post(
  "/create",
  controller.createConversation
);

router.post(
  "/participant",
  controller.addParticipant
);

router.get(
  "/my-chats/:userId",
  controller.getUserConversations
);

router.delete(
  "/:conversationSid",
  controller.deleteConversation
);

router.post(
  "/token",
  controller.generateToken
);

module.exports = router;