const Location = require("../models/Location");
const User = require("../models/User");
const Order = require("../models/Order");
const logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseService");

class LocationController {
  addLocation = asyncHandler(async (req, res) => {
    const { driver, order, latitude, longitude } = req.body;

    // check if driver exist
    const driverExists = await User.findById(driver).lean();
    if (!driverExists) {
      const resp = error("Driver not found", 404);
      return res.status(resp.status).json(resp);
    }

    // check if order exist
    const orderExists = await Order.findById(order).lean();
    if (!orderExists) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

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
      { new: true, upsert: true },
    );

    logger.info("Driver location added", {
      event: "LOCATION_UPDATE",
      order,
      driver,
      latitude,
      longitude,
    });

    const resp = success(location, "Location added", 200);
    return res.status(resp.status).json(resp);
  });

  getOrderLocation = asyncHandler(async (req, res) => {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    const latestLocation = await Location.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .populate("driver", "name phone")
      .select("location createdAt");

    if (!latestLocation) {
      const resp = error("No location found for this order", 404);
      return res.status(resp.status).json(resp);
    }
    const resp = success(
      latestLocation,
      "Latest order location retrieved",
      200,
    );
    return res.status(resp.status).json(resp);
  });
}
module.exports = new LocationController();
