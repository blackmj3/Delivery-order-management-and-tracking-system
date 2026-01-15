const Location = require("../models/Location");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const cache = require("../utils/cacheService");
const logger = require("../utils/logger");
const mongoose = require("mongoose");
module.exports = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    //#1 add drivers and clients to connectedUsers map
    socket.on("register", (userId) => {
      connectedUsers.set(userId.toString(), socket.id);
      //log
      logger.info("User registered via socket", {
        userId: userId.toString(),
        socketId: socket.id,
        event: "register",
      });
    });
    //#2 join to order room to track order
    socket.on("joinOrderRoom", async ({ orderId }) => {
      socket.join(orderId);
      //get order document one time
      let orderDoc = await Order.findById(orderId).lean();
      if (!orderDoc) {
        orderDoc = {
          client: "695ae34503480665b8f821ed",
          driver: "65f8e1b9a2d9c1234567890a",
          deliveryLocation: {
            coordinates: [35.91055, 31.9539],
          },
        };
      } //return
      //save it in cache
      cache.set(
        `order:${orderId}`,
        {
          clientId: orderDoc.client,
          deliveryLocation: orderDoc.deliveryLocation,
          isNearNotified: false,
        },
        600
      );

      logger.info("Socket joined order room", {
        socketId: socket.id,
        orderId,
        event: "joinOrderRoom",
      });
    });
    //#3 update location
    socket.on("updateLocation", async (data) => {
      const { driver, order, latitude, longitude } = data;
      //save data with cach service
      const locationCacheKey = `order:${order}:location`;
      cache.set(
        locationCacheKey,
        { driver, order, longitude, latitude, updatedAt: Date.now() },
        30
      );
      //update in database but every 15 seconds
      const dbCacheKey = `order:${order}:lastDbSave`;
      const lastDbSave = cache.get(dbCacheKey);
      const now = Date.now();
      if (!lastDbSave || now - lastDbSave > 15000) {
        await Location.findOneAndUpdate(
          { driver, order },
          {
            driver,
            order,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
          { new: true, upsert: true }
        );

        cache.set(dbCacheKey, Date.now(), 60);
        logger.info("update on database and cache", {
          dbCacheKey,
          lastDbSave,
        });
      }
      io.to(order).emit("locationUpdated", {
        driver,
        order,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      });
      //get order document from cache to get client location
      const orderCached = cache.get(`order:${order}`);
      if (!orderCached) return;
      const [clientLng, clientLat] = orderCached.deliveryLocation.coordinates;
      //calculate distance
      const result = await Location.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [clientLng, clientLat],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance: 500,
            query: {
              order: new mongoose.Types.ObjectId(order),
              driver: new mongoose.Types.ObjectId(driver),
            },
          },
        },
      ]);
      //if the distance between client and driver if less than 500 m send notification to client
      if (result.length > 0 && !orderCached.isNearNotified) {
        const clientId = orderCached.clientId;
        const clientSocketId = connectedUsers.get(clientId.toString());
        if (clientSocketId) {
          const notification = await Notification.create({
            user: clientId,
            title: "Driver Nearby",
            message: `Your driver is just a few meters away`,
            type: "ORDER_NEARBY",
            order,
          });
          orderCached.isNearNotified = true;
          io.to(clientSocketId).emit("newNotification", notification);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
