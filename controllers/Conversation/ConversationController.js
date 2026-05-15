const { client, SERVICE_SID } = require("../../config/twilio");
const twilio = require("twilio");

const Conversation = require("../../models/Conversation/Conversation");
exports.createConversation = async (req, res) => {
    try {
        const {
            participants,
            friendlyName,
            isGroup,
            groupAdmin,
            groupImage,
        } = req.body;

        if (
            !participants ||
            participants.length < 2
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Participants required",
            });
        }

        // ✅ EXISTING CHECK
        const existingConversation =
            await Conversation.findOne({
                participants: {
                    $all: participants,
                    $size:
                        participants.length,
                },
            });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                conversation:
                    existingConversation,
            });
        }

        // ✅ CREATE TWILIO ROOM
        const conversation =
            await client.conversations.v1
                .services(
                    SERVICE_SID
                )
                .conversations.create({
                    friendlyName:
                        friendlyName ||
                        "Private Chat",
                });

        // ✅ ADD PARTICIPANTS
        for (const participant of participants) {
            await client.conversations.v1
                .services(
                    SERVICE_SID
                )
                .conversations(
                    conversation.sid
                )
                .participants.create({
                    identity:
                        participant.toString(),
                });
        }

        // ✅ SAVE DB
        const savedConversation =
            await Conversation.create({
                twilioConversationSid:
                    conversation.sid,

                friendlyName:
                    friendlyName ||
                    "Private Chat",

                participants,

                isGroup:
                    isGroup || false,

                groupAdmin:
                    groupAdmin ||
                    null,

                groupImage:
                    groupImage ||
                    null,
            });

        res.status(201).json({
            success: true,
            conversation:
                savedConversation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.addParticipant = async (req, res) => {
    try {
        const { conversationSid, identity } = req.body;

        if (!conversationSid || !identity) {
            return res.status(400).json({
                success: false,
                message: "conversationSid and identity are required",
            });
        }

        const participant = await client.conversations.v1
            .services(SERVICE_SID)
            .conversations(conversationSid)
            .participants.create({
                identity,
            });

        res.status(201).json({
            success: true,
            participantSid: participant.sid,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants", "name email profileImage")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        const { conversationSid } = req.params;

        await client.conversations.v1
            .services(SERVICE_SID)
            .conversations(conversationSid)
            .remove();

        await Conversation.findOneAndDelete({
            twilioConversationSid: conversationSid,
        });

        res.status(200).json({
            success: true,
            message: "Conversation deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.generateToken = async (req, res) => {
  try {
    const { identity } = req.body;

    if (!identity) {
      return res.status(400).json({
        success: false,
        message: "identity is required",
      });
    }

    const AccessToken = twilio.jwt.AccessToken;

    const ChatGrant = AccessToken.ChatGrant;

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      {
        identity,
      }
    );

    const chatGrant = new ChatGrant({
      serviceSid: SERVICE_SID,
    });

    token.addGrant(chatGrant);

    res.status(200).json({
      success: true,
      token: token.toJwt(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};