const Notification = require("../models/Notification");

const logger = require("../utils/logger");
const { success, error } = require("../utils/responseService");
const asyncHandler = require("../utils/asyncHandler");

class NotificationController {
  markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      const resp = error("Notification not found", 404);
      return res.status(resp.status).json(resp);
    }

    logger.info("Notification marked as read", { notificationId: id });

    const resp = success(notification, "Notification marked as read", 200);
    return res.status(resp.status).json(resp);
  });
}
module.exports = new NotificationController();
