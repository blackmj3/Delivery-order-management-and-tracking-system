let ioInstance = null;
let connectedUsers = null;
const Notification = require("../models/Notification");
const logger = require("../utils/logger");
const { success, error } = require("../utils/responseService");
class NotificationController {
  setIo = (io, usersMap) => {
    ioInstance = io;
    connectedUsers = usersMap;
  };

  async newOrderNotification(req, res) {
    const { driver, order } = req.body;
    //log
    logger.info("Order arrived", {
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
        logger.info("Notification emitted to driver", {
          driver,
          socketId: driverSocketId,
        });
      } else {
        logger.warn("Driver is not connected, notification not sent", {
          driver,
        });
      }
    }
    return res
      .status(200)
      .json(success(notification, "Notification created and broadcasted"));
  }
  async acceptOrderNotification(req, res) {
    const { driver, order, client } = req.body;
    //log
    logger.info("Order accepted", {
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
        ioInstance.to(clientSocketId).emit("orderAccepted", { orderId: order });
        logger.info("Notification emitted to client", {
          client,
          socketId: clientSocketId,
        });
      } else {
        logger.warn("Client is not connected, notification not sent", {
          client,
        });
      }
      const driverSocketId = connectedUsers.get(driver.toString());
      if (driverSocketId) {
        ioInstance.to(driverSocketId).emit("orderAccepted", { orderId: order });
        logger.info("Order accepted event emitted to driver", {
          driver,
          socketId: driverSocketId,
        });
      } else {
        logger.warn("Driver is not connected, orderAccepted event not sent", {
          driver,
        });
      }
    }
    return res
      .status(200)
      .json(success(notification, "Order accepted notification sent"));
  }
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
