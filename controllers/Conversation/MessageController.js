const { client, SERVICE_SID } = require("../../config/twilio");

exports.sendMessage = async (req, res) => {
  try {
    const {
      conversationSid,
      author,
      message,
    } = req.body;

    if (
      !conversationSid ||
      !author ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const msg = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.create({
        author,
        body: message,
      });

    res.status(201).json({
      success: true,
      messageSid: msg.sid,
      body: msg.body,
      author: msg.author,
      dateCreated: msg.dateCreated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const { conversationSid } = req.params;

    if (!conversationSid) {
      return res.status(400).json({
        success: false,
        message: "conversationSid required",
      });
    }

    const messages = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.list({
        limit: 50,
      });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



exports.markAsRead = async (req, res) => {
  try {
    const { conversationSid, identity } = req.body;

    if (!conversationSid || !identity) {
      return res.status(400).json({
        success: false,
        message: "conversationSid & identity required",
      });
    }

    const conversation = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid);

    const participants = await conversation.participants.list();

    const participant = participants.find(
      (p) => p.identity === identity
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    await conversation
      .participants(participant.sid)
      .update({
        lastReadMessageIndex: null,
      });

    res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};