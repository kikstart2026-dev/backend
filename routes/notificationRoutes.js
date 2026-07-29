const express = require("express");

const router = express.Router();

const {
  getCoachNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
   deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");

router.get(
  "/coach/:coachId",
  getCoachNotifications
);

router.get(
  "/unread/:coachId",
  getUnreadCount
);

router.patch(
  "/read/:id",
  markAsRead
);

router.put(
  "/read-all/:coachId",
  markAllAsRead
); 

router.delete("/delete/:id", deleteNotification);

router.delete("/clear/:coachId", clearNotifications);

module.exports = router;