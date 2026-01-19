const express = require("express");
const NotificationController = require("../controllers/notificationController");

const { requireAuth } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const {validateNotificationId} = require("../validations/notificationVlidator");
const router = express.Router();

//mark as read notification
router.patch(
  "/:id/read",
  requireAuth,
  [...validateNotificationId, validate],
  NotificationController.markNotificationAsRead,
);
module.exports = router;
