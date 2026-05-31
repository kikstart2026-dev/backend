const { client, SERVICE_SID } = require("../../config/twilio");

exports.sendMessage = async (req, res) => {
  try {
    const { conversationSid, author, message } = req.body;

    if (!conversationSid || !author || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ১. Twilio-তে নতুন মেসেজ তৈরি
    const msg = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.create({
        author,
        body: message,
        attributes: JSON.stringify({
          seenBy: [author], // sender already seen
        }),
      });

    // ২. প্রেরকের জন্য মেসেজটি অটোমেটিকভাবে 'Read' হিসেবে মার্ক করা
    try {
      if (msg && typeof msg.index === "number") {
        const participants = await client.conversations.v1
          .services(SERVICE_SID)
          .conversations(conversationSid)
          .participants.list();

        const currentParticipant = participants.find((p) => p.identity === author);

        if (currentParticipant) {
          await client.conversations.v1
            .services(SERVICE_SID)
            .conversations(conversationSid)
            .participants(currentParticipant.sid)
            .update({
              lastReadMessageIndex: msg.index,
            });
        }
      }
    } catch (syncError) {
      console.error("Failed to sync lastReadMessageIndex for sender:", syncError.message);
    }

    // ৩. সফল রেসপন্স
    return res.status(201).json({
      success: true,
      messageSid: msg.sid,
      body: msg.body,
      author: msg.author,
      dateCreated: msg.dateCreated,
    });
  } catch (error) {
    return res.status(500).json({
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
        limit: 50, // প্রোডাকশনে এখানে পেজিনেশন চালু করা ভালো
      });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationSid, identity, lastReadMessageIndex } = req.body;

    if (!conversationSid || !identity) {
      return res.status(400).json({
        success: false,
        message: "conversationSid & identity required",
      });
    }

    const conversation = client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid);

    const participants = await conversation.participants.list();
    const participant = participants.find((p) => p.identity === identity);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    let targetIndex = lastReadMessageIndex;
    
    // যদি ফ্রন্টএন্ড ইডেক্স না পাঠায়, তবে চ্যাটের সর্বশেষ মেসেজের ইডেক্স খুঁজে বের করবে
    if (targetIndex === undefined || targetIndex === null) {
      const messages = await conversation.messages.list({ limit: 1 });
      targetIndex = messages.length > 0 ? messages[0].index : 0;
    }

    await conversation.participants(participant.sid).update({
      lastReadMessageIndex: Number(targetIndex),
    });

    return res.status(200).json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.markMessagesAsSeen = async (req, res) => {
  try {
    const { conversationSid, userId } = req.body;

    const messages = await client.conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .messages.list({ limit: 100 });

    for (const msg of messages) {
      let attrs = {};

      try {
        attrs = JSON.parse(msg.attributes || "{}");
      } catch {
        attrs = {};
      }

      const seenBy = attrs.seenBy || [];

      if (!seenBy.includes(userId)) {
        seenBy.push(userId);

        await client.conversations.v1
          .services(SERVICE_SID)
          .conversations(conversationSid)
          .messages(msg.sid)
          .update({
            attributes: JSON.stringify({
              ...attrs,
              seenBy,
            }),
          });
      }
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};