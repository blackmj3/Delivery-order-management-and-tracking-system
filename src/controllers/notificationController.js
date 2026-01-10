let ioInstance = null;
let connectedUsers = null;
const Notification = require("../models/Notification");
const { success, error } = require("../utils/responseService");
class NotificationController {
  setIo = (io, usersMap) => {
    ioInstance = io;
    connectedUsers = usersMap;
  };

  async newOrderNotification(req, res) {
    const { driver, order } = req.body;
    //log
    req.log.info("Order arrived", {
      event: "ORDER_ARRIVED",
      order,
      driver,
    });
    const notification = await Notification.create({
      user: driver,
      title: "New Order Available",
      message: "You have received a new delivery request",
      type: "NEW_ORDER",
      order: order,
    });
    if (ioInstance) {
      const driverSocketId = connectedUsers.get(driver.toString());
      if (driverSocketId) {
        ioInstance.to(driverSocketId).emit("newNotification", notification);
      }
    }
    success(res, notification, "new order notification", 200);
  }
  async acceptOrderNotification(req, res) {
    const { driver, order, client } = req.body;
    //log
    req.log.info("Order accepted", {
      event: "ORDER_ACCEPTED",
      order,
      driver,
    });
    const notification = await Notification.create({
      user: client,
      title: "Your Order Is Accepted",
      message: "Your order is accepted, track its location",
      type: "ORDER_ACCEPTED",
      order,
    });
    if (ioInstance) {
      const clientSocketId = connectedUsers.get(client.toString());
      //after driver accept order send notification to client then join driver and client to order room
      if (clientSocketId) {
        ioInstance.to(clientSocketId).emit("newNotification", notification);
        ioInstance.to(clientSocketId).emit("orderAccepted", {
          orderId: order,
        });
      }
      const driverSocketId = connectedUsers.get(driver.toString());
      if (driverSocketId) {
        ioInstance.to(driverSocketId).emit("orderAccepted", {
          orderId: order,
        });
      }
    }
    success(res, notification, "order accepted notification", 200);
  }
  async markNotificationAsRead(req, res) {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      error(res, "notification not found", 404, notification);
    }
    success(res, notification, "notification mark as read", 200);
  }
}
module.exports = new NotificationController();
