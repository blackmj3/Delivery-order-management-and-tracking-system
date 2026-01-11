const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middlewares/validate");
const requireAuth = require("../middlewares/requireAuth");
const authorize = require("../middlewares/authorize");
const {
  createOrderValidate,
  orderIdValidate,
  updateOrderStatusValidate,
} = require("../validations/order.validate");


// Get my orders
router.get(
  "/my-orders",requireAuth,
  authorize("CLIENT", "DRIVER"),
  asyncHandler(orderController.getMyOrders)
);

// Get open orders
router.get(
  "/open", requireAuth,
  authorize("DRIVER"),
  asyncHandler(orderController.getOpenOrders)
);

// Get order by id
router.get(
  "/:id",  requireAuth,
  [...orderIdValidate, validate],
  asyncHandler(orderController.getOrderById)
);

// POST

// Create order
router.post(
  "/",  requireAuth,
  authorize("CLIENT"),
  [...createOrderValidate, validate ],
  asyncHandler(orderController.createOrder)
);

// PUT

// Accept order
router.put(
  "/:id/accept", requireAuth,
  authorize("DRIVER"),
  [...orderIdValidate,validate],
  asyncHandler(orderController.acceptOrder)
);

// Update order status
router.put(
  "/:id/status",  requireAuth,
  authorize("DRIVER", "ADMIN"),
  [...orderIdValidate, ...updateOrderStatusValidate,validate],
  asyncHandler(orderController.updateOrderStatus)
);

module.exports = router;
