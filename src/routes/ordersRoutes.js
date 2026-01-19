const express = require("express");
const orderController = require("../controllers/orderController");

const validate = require("../middlewares/validationMiddleware");
const { requireAuth, authorize } = require("../middlewares/authMiddleware");

const {
  createOrderValidate,
  orderIdValidate,
  updateOrderStatusValidate,
} = require("../validations/orderValidate");
const router = express.Router();

// GET

// Get my orders (CLIENT / DRIVER)
router.get(
  "/my-orders",
  requireAuth,
  authorize("CLIENT", "DRIVER"),
  orderController.getMyOrders
);

// Get open orders (DRIVER)
router.get(
  "/open",
  requireAuth,
  authorize("DRIVER"),
  orderController.getOpenOrders
);

// Get order by id (CLIENT / DRIVER / ADMIN)
router.get(
  "/:id",
  requireAuth,
  authorize("CLIENT", "DRIVER", "ADMIN"),
  [...orderIdValidate, validate],
  orderController.getOrderById
);

// POST

// Create order (CLIENT)
router.post(
  "/",
  requireAuth,
  authorize("CLIENT"),
  [...createOrderValidate, validate],
  orderController.createOrder
);

// PUT

// Accept order (DRIVER)
router.put(
  "/:id/accept",
  requireAuth,
  authorize("DRIVER"),
  [...orderIdValidate, validate],
  orderController.acceptOrder
);

// Update order status (DRIVER / ADMIN)
router.put(
  "/:id/status",
  requireAuth,
  authorize("DRIVER", "ADMIN"),
  [...orderIdValidate, ...updateOrderStatusValidate, validate],
  orderController.updateOrderStatus
);

module.exports = router;