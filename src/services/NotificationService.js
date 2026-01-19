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
      }

      const driverSocketId = connectedUsers.get(driver.toString());
      if (driverSocketId) {
        ioInstance
          .to(driverSocketId)
          .emit("orderAccepted", { orderId: orderId });
      }
    }

    return notification;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  setIo,
  sendNewOrderNotification,
  sendAcceptOrderNotification,
};
