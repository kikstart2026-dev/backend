const Notification = require("../models/notificationModel");

// ======================================
// GET COACH NOTIFICATIONS
// ======================================

exports.getCoachNotifications = async (req, res) => {
  try {
    const { coachId } = req.params;

    const notifications = await Notification.find({
      coachId,
    })
      .populate("childId", "fullName profileImage")
      .populate("programId", "title image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// UNREAD COUNT
// ======================================

exports.getUnreadCount = async (req, res) => {
  try {
    const { coachId } = req.params;

    const count = await Notification.countDocuments({
      coachId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// MARK AS READ
// ======================================

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification =
      await Notification.findByIdAndUpdate(
        id,
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { coachId } = req.params;

    await Notification.updateMany(
      {
        coachId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};