const mongoose = require("mongoose");
const Order = require("../models/Order");

const validateOrderFilters = (req, res, next) => {
  const { pickupAddress, status, driver, from, to } = req.query;
  const filters = {};

  // pickupAddress (city) filter
  if (pickupAddress && typeof pickupAddress !== "string") {
    return res.status(400).json({ error: "city must be a string" });
  }
  if (pickupAddress) {
    filters.pickupAddress = {
      $regex: pickupAddress,
      $options: "i",
    };
  }
  // status filter ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
  if (status) {
    const Status = Order.schema.path("status").enumValues;
    const allowedStatuses = status.toUpperCase();
    if (typeof status !== "string" || !Status.includes(allowedStatuses)) {
      return res.status(400).json({
        error: `status must be one of the following: ${Status.join(", ")}`,
      });
    }
    filters.status = allowedStatuses;
  }

  // driverId filter
  if (driver && !mongoose.Types.ObjectId.isValid(driver)) {
    return res.status(400).json({ error: "driverId is not a valid ObjectId" });
  }
  if (driver) filters.driver = driver;

  // date filter
  if (to && !from) {
    return res.status(400).json({
      error: "from date must be provided when using to",
    });
  }

  if (from) {
    if (isNaN(Date.parse(from))) {
      return res.status(400).json({ error: "Invalid from date format" });
    }

    const fromDate = new Date(from);

    // إذا في to → فلترة بين تاريخين
    if (to) {
      if (isNaN(Date.parse(to))) {
        return res.status(400).json({ error: "Invalid to date format" });
      }

      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      filters.createdAt = {
        $gte: fromDate,
        $lte: toDate,
      };
    }
    // إذا في from بس → من التاريخ وطالع
    else {
      filters.createdAt = {
        $gte: fromDate,
      };
    }
  }

  req.exportFilters = filters;

  next();
};
module.exports = { validateOrderFilters };
