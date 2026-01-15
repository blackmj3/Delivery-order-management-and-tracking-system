const Notification = require("../models/Notification");
const logger = require("../utils/logger");
const { success, error } = require("../utils/responseService");
class NotificationController {
  async markNotificationAsRead(req, res) {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      logger.warn("Notification not found", { notificationId: id });
      return res.status(404).json(error("Notification not found", 404));
    }

    logger.info("Notification marked as read", { notificationId: id });
    return res
      .status(200)
      .json(success(notification, "Notification marked as read"));
  }
}
module.exports = new NotificationController();
