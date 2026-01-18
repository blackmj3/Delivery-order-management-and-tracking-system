const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/authMiddleware");
const {
  validateNotificationId,
} = require("../validations/notificationVlidator");
const validate = require("../middlewares/validationMiddleware");

const NotificationController = require("../controllers/notificationController");

//mark as read notification
router.patch(
  "/:id/read",
  requireAuth,
  [...validateNotificationId, validate],
  NotificationController.markNotificationAsRead,
);
module.exports = router;
