const express = require("express");
const locationController = require("../controllers/locationController");
const asyncHandler = require("../utils/asyncHandler");
const validateCreateLocation = require("../validations/LocationValidator");
const validate = require("../middlewares/validationMiddleware");
const { orderIdValidate } = require("../validations/orderValidate");
const { requireAuth, authorize } = require("../middlewares/authMiddleware");
const router = express.Router();
//add location by driver only
router.post(
  "/",
  requireAuth,
  authorize("DRIVER"),
  [...validateCreateLocation, validate],
  asyncHandler(locationController.addLocation)
);

//get order location
router.get(
  "/order/:id/latest",
  requireAuth,
  [...orderIdValidate, validate],
  asyncHandler(locationController.getOrderLocation)
);

module.exports = router;
