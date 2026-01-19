const Location = require("../models/Location");
const User = require("../models/User");
const Order = require("../models/Order");

const cache = require("../utils/cacheService");
const logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseService");

class LocationController {

  addLocation = asyncHandler(async (req, res) => {
    const { driver, order, latitude, longitude } = req.body;

    // validate required fields
    if (driver == null || order == null || latitude == null || longitude == null) {
      const resp = error("driver, order, latitude, and longitude are required", 400);
      return res.status(resp.status).json(resp);
    }

    // check if driver exist
    const driverExists = await User.findById(driver).lean();
    if (!driverExists) {
      logger.error(`Driver ${driver} not found`);
      const resp = error("Driver not found", 404);
      return res.status(resp.status).json(resp);
    }

    // check if order exist
    const orderExists = await Order.findById(order).lean();
    if (!orderExists) {
      logger.error(`Order ${order} not found`);
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

    // Cache latest location (optional, expires in 60s)
    await cache.set(`location_${order}_${driver}`, location, 60);

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
    
     // Try cache first
    const cachedLocation = await cache.get(`location_${orderId}`);
    if (cachedLocation) {
      logger.info(`Location for order ${orderId} retrieved from cache`);
      const resp = success(cachedLocation, "Location retrieved from cache", 200);
      return res.status(resp.status).json(resp);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      logger.error(`Order ${orderId} not found`);
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    const latestLocation = await Location.findOne({ order: orderId })
      .sort({ createdAt: -1 })
      .populate("driver", "name phone")
      .select("location createdAt");

    if (!latestLocation) {
      logger.warn(`No location found for order ${orderId}`);
      const resp = error("No location found for this order", 404);
      return res.status(resp.status).json(resp);
    }

    // Cache result
    await cache.set(`location_${orderId}`, latestLocation, 60);

    logger.info(`Latest location for order ${orderId} retrieved successfully`);
    const resp = success(
      latestLocation,
      "Latest order location retrieved",
      200,
    );
    return res.status(resp.status).json(resp);
  });
}
module.exports = new LocationController();
