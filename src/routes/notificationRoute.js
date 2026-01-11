const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const validateCreateLocation = require("../validations/LocationValidator");
const validate = require("../middlewares/validationMiddleware");
const NotificationController = require("../controllers/notificationController");
router.post(
  "/newOrder",
  asyncHandler(NotificationController.newOrderNotification)
);
router.post(
  "/orderAccepted",
  asyncHandler(NotificationController.acceptOrderNotification)
);
router.patch(
  "/:id/read",
  asyncHandler(NotificationController.markNotificationAsRead)
);
module.exports = router;
