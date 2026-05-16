const { client, SERVICE_SID } = require("../../config/twilio");
const Conversation = require("../../models/Conversation/Conversation");

/* ================= SEND MESSAGE ================= */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationSid, author, message } = req.body;

    if (!conversationSid || !author || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // SEND MESSAGE TO TWILIO
    const msg = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.create({
        author,
        body: message,
      });

    // UPDATE CONVERSATION (sidebar last message)
    await Conversation.findOneAndUpdate(
      { twilioConversationSid: conversationSid },
      {
        lastMessage: message,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: {
        sid: msg.sid,
        body: msg.body,
        author: msg.author,
        dateCreated: msg.dateCreated,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/* ================= GET MESSAGES ================= */
exports.getMessages = async (req, res) => {
  try {
    const { conversationSid } = req.params;

    if (!conversationSid) {
      return res.status(400).json({
        success: false,
        message: "conversationSid required",
      });
    }

    // UPDATE last active time
    await Conversation.findOneAndUpdate(
      { twilioConversationSid: conversationSid },
      { updatedAt: new Date() }
    );

    // FETCH MESSAGES (FIXED ORDER)
    const messages = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.list({
        limit: 50,
        order: "asc", // 🔥 CRITICAL FIX
      });

    // NORMALIZE RESPONSE (IMPORTANT FOR FRONTEND)
    const formattedMessages = messages.map((m) => ({
      sid: m.sid,
      body: m.body,
      author: m.author,
      dateCreated: m.dateCreated,
    }));

    return res.status(200).json({
      success: true,
      messages: formattedMessages,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};