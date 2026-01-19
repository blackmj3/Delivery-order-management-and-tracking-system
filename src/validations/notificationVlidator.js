const { body, param } = require("express-validator");

const validateNotificationId = [
  param("id").isMongoId().withMessage("Invalid order id"),
];

module.exports = {
  validateNotificationId,
};
