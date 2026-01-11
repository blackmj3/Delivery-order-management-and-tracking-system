const express = require("express");
const locationController = require("../controllers/locationController");
const asyncHandler = require("../utils/asyncHandler");
const validateCreateLocation = require("../validations/LocationValidator");
const validate = require("../middlewares/validationMiddleware");
const router = express.Router();
//driver only
router.post(
  "/",
  [...validateCreateLocation, validate],
  asyncHandler(locationController.addLocation)
);

//admin and client
router.get(
  "/order/:orderId/latest",
  asyncHandler(locationController.getOrderLocation)
);

module.exports = router;
