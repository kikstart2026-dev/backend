const express = require("express");

const router = express.Router();

const {
  getCoachNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
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

module.exports = router;