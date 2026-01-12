const Location = require("../models/Location");
const User = require("../models/User");
const Order = require("../models/Order");
const logger = require("../utils/logger");
const cache = require("../utils/cacheService");
const { success, error } = require("../utils/responseService");

class LocationController {
  async addLocation(req, res) {
    const { driver, order, latitude, longitude } = req.body;
    // log location
    logger.info("Driver location added", {
      event: "LOCATION_UPDATE",
      order,
      driver,
      latitude,
      longitude,
    });

    const location = await Location.findOneAndUpdate(
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

    return res
      .status(200)
      .json(success(location, "Location added and broadcasted"));
  }

  async getOrderLocation(req, res) {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      logger.warn("Order not found", { orderId });
      return res.status(404).json(error("Order not found", 404));
    }
    const latestLocation = await Location.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .populate("driver", "name phone")
      .select("location createdAt");

    if (!latestLocation) {
      logger.warn("No location found for this order", { orderId });
      return res
        .status(404)
        .json(error("No location found for this order", 404));
    }
    logger.info("Latest order location retrieved", {
      orderId,
      location: latestLocation,
    });
    return res
      .status(200)
      .json(success(latestLocation, "Latest order location retrieved"));
  }
}
module.exports = new LocationController();
