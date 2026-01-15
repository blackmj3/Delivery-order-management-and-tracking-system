const Notification = require("../models/Notification");
const logger = require("../utils/logger");

let ioInstance = null;
let connectedUsers = null;

const setIo = (io, usersMap) => {
  ioInstance = io;
  connectedUsers = usersMap;
};

//send notification when client create new order
async function sendNewOrderNotification({ driver, orderId }) {
  try {
    logger.info("Order arrived", {
      event: "ORDER_ARRIVED",
      orderId,
      driver,
    });

    const notification = await Notification.create({
      user: driver,
      title: "New Order Available",
      message: "You have received a new delivery request",
      type: "NEW_ORDER",
      orderId,
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

    return notification;
  } catch (err) {
    logger.error("sendNewOrderNotification failed", err);
    throw err;
  }
}
//send notification when driver accept order
async function sendAcceptOrderNotification({ client, driver, orderId }) {
  try {
    const notification = await Notification.create({
      user: client,
      title: "Your Order Is Accepted",
      message: "Your order is accepted, track its location",
      type: "ORDER_ACCEPTED",
      orderId,
    });
    //join driver and client to order room
    if (ioInstance) {
      const clientSocketId = connectedUsers.get(client.toString());
      if (clientSocketId) {
        ioInstance.to(clientSocketId).emit("newNotification", notification);
        ioInstance
          .to(clientSocketId)
          .emit("orderAccepted", { orderId: orderId });
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
        ioInstance
          .to(driverSocketId)
          .emit("orderAccepted", { orderId: orderId });
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

    logger.info("Order accepted", {
      event: "ORDER_ACCEPTED",
      orderId,
      driver,
    });

    return notification;
  } catch (err) {
    logger.error("sendAcceptOrderNotification failed", err);
    throw err;
  }
}

module.exports = {
  setIo,
  sendNewOrderNotification,
  sendAcceptOrderNotification,
};
