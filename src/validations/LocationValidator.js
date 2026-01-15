const { body, params } = require("express-validator");
const validateCreateLocation = [
  body("driver")
    .notEmpty()
    .withMessage("driver required")
    .isMongoId()
    .withMessage("driver must be mongoId "),

  body("order")
    .notEmpty()
    .withMessage("order required")
    .isMongoId()
    .withMessage("order must be mongoId"),

  body("latitude")
    .notEmpty()
    .withMessage("latitude required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitud must be between 90 , -90"),

  body("longitude")
    .notEmpty()
    .withMessage("longitude required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between 180 , -180"),
];

module.exports = validateCreateLocation;
