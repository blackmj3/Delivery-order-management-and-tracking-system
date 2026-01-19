const { body, param } = require("express-validator");
const Order = require("../models/Order");

// Create Order Validation (CLIENT)
const createOrderValidate = [
  body("driver").isMongoId().withMessage("Invalid driver id"),

  body("pickupAddress")
    .isString()
    .withMessage("Pickup address must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Pickup address is too short"),

  body("deliveryLocation.type")
    .equals("Point")
    .withMessage("deliveryLocation.type must be 'Point'"),

  body("deliveryLocation.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be an array [lng, lat]")
    .bail(),

  body("deliveryLocation.coordinates.0")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),

  body("deliveryLocation.coordinates.1")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Description is too short"),

  body("expectedTime")
    .optional()
    .isISO8601()
    .withMessage("Expected time must be a valid date"),
];

// Order ID Param Validation
const orderIdValidate = [
  param("id").isMongoId().withMessage("Invalid order id"),
];

// Update Order Status Validation
const updateOrderStatusValidate = [
  body("status")
    .isString()
    .withMessage("Status must be string")
    .isIn(["CANCELLED", "ON_THE_WAY", "DELIVERED"])
    .withMessage(
      'Status must be one of ["CANCELLED", "ON_THE_WAY", "DELIVERED"]'
    ),
];

module.exports = {
  createOrderValidate,
  orderIdValidate,
  updateOrderStatusValidate,
};
