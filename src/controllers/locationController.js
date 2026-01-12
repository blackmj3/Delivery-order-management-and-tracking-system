const Location = require("../models/Location");
const User = require("../models/User");
const Order = require("../models/Order");
const cache = require("../utils/cacheService");
const { success, error } = require("../utils/responseService");

class LocationController {
  async addLocation(req, res) {
    const { driver, order, latitude, longitude } = req.body;
    // log location
    req.log.info("Driver location added", {
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

    success(res, location, "Location added and broadcasted", 200);
  }

  async getOrderLocation(req, res) {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return error(res, "Order not found", 404);
    }
    const latestLocation = await Location.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .populate("driver", "name phone")
      .select("location createdAt");

    if (!latestLocation) {
      return error(res, "No location found for this order", 404);
    }

    success(res, latestLocation, "Latest order location retrieved", 200);
  }
}
module.exports = new LocationController();
