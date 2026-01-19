const Order = require("../models/Order");
const cache = require("../utils/cacheService");
const logger = require("../utils/logger");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseService");
const { createLog } = require("../utils/ActivityLog");
const NotificationService = require("../services/NotificationService");

class OrderController {
  // Create Order (CLIENT)
  createOrder = asyncHandler(async (req, res) => {
    const {
      driver,
      pickupAddress,
      description,
      expectedTime,
      deliveryLocation,
    } = req.body;

    const userId = (req.user._id || req.user.id).toString();

    if (
      !deliveryLocation ||
      !deliveryLocation.type ||
      !deliveryLocation.coordinates
    ) {
      const resp = error(
        "Delivery location is required and must be a GeoJSON Point",
        400
      );
      return res.status(resp.status).json(resp);
    }

    const order = await Order.create({
      client: userId,
      driver,
      pickupAddress,
      description,
      expectedTime,
      deliveryLocation,
    });

    cache.clear(`my-orders:${userId}`);

    logger.info("Order created", { orderId: order._id, clientId: userId });

    await createLog({
      userId,
      role: req.user.role,
      orderId: order._id,
      action: "CREATE_ORDER",
      details: "Client created a new order",
    });

    if (driver) {
      await NotificationService.sendNewOrderNotification({
        driver,
        orderId: order._id,
      });
    }

    const resp = success(order, "Order created successfully", 201);
    return res.status(resp.status).json(resp);
  });

  // Get My Orders
  getMyOrders = asyncHandler(async (req, res) => {
    const userId = (req.user._id || req.user.id).toString();
    const cacheKey = `my-orders:${userId}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.status(cached.status).json(cached);

    let filter = {};
    if (req.user.role === "CLIENT") filter.client = userId;
    if (req.user.role === "DRIVER") filter.driver = userId;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("client", "name email")
      .populate("driver", "name");

    const resp = success(orders, "Orders fetched successfully");
    cache.set(cacheKey, resp, 60);

    return res.status(resp.status).json(resp);
  });

  // Get Open Orders
  getOpenOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .populate("client", "name");

    const resp = success(orders, "Open orders fetched");
    return res.status(resp.status).json(resp);
  });

  // Accept Order
  acceptOrder = asyncHandler(async (req, res) => {
    const userId = (req.user._id || req.user.id).toString();
    const order = await Order.findById(req.params.id);

    if (!order) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    if (order.status !== "PENDING") {
      const resp = error("Order is not available", 400);
      return res.status(resp.status).json(resp);
    }

    order.driver = userId;
    order.status = "ACCEPTED";
    await order.save();

    cache.clear(`my-orders:${userId}`);
    cache.clear(`my-orders:${order.client.toString()}`);

    logger.info("Order accepted", { orderId: order._id, driverId: userId });

    await createLog({
      userId,
      role: req.user.role,
      orderId: order._id,
      action: "ACCEPT_ORDER",
      details: "Driver accepted the order",
    });

    await NotificationService.sendAcceptOrderNotification({
      client: order.client,
      driver: order.driver,
      orderId: order._id,
    });

    const resp = success(order, "Order accepted successfully");
    return res.status(resp.status).json(resp);
  });

  // Update Order Status
  updateOrderStatus = asyncHandler(async (req, res) => {
    const userId = (req.user._id || req.user.id).toString();
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    if (
      req.user.role === "DRIVER" &&
      order.driver?.toString() !== userId
    ) {
      const resp = error("Not allowed to update this order", 403);
      return res.status(resp.status).json(resp);
    }

    const allowedTransitions = {
      PENDING: ["CANCELLED"],
      ACCEPTED: ["ON_THE_WAY", "CANCELLED"],
      ON_THE_WAY: ["DELIVERED"],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      const resp = error(
        `Invalid status transition from ${order.status} to ${status}`,
        400
      );
      return res.status(resp.status).json(resp);
    }

    order.status = status;
    await order.save();

    cache.clear(`my-orders:${order.client.toString()}`);
    if (order.driver) {
      cache.clear(`my-orders:${order.driver.toString()}`);
    }

    logger.info("Order status updated", { orderId: order._id, status });

    await createLog({
      userId,
      role: req.user.role,
      orderId: order._id,
      action: "UPDATE_ORDER_STATUS",
      details: `Order status changed to ${status}`,
    });

    const resp = success(order, "Order status updated successfully");
    return res.status(resp.status).json(resp);
  });

  // Get Order By ID
  getOrderById = asyncHandler(async (req, res) => {
    const userId = (req.user._id || req.user.id).toString();

    const order = await Order.findById(req.params.id)
      .populate("client", "name email")
      .populate("driver", "name");

    if (!order) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    const isOwner =
      order.client._id.toString() === userId ||
      order.driver?._id?.toString() === userId;

    if (!isOwner && req.user.role !== "ADMIN") {
      const resp = error("Access denied", 403);
      return res.status(resp.status).json(resp);
    }

    const resp = success(order, "Order fetched successfully");
    return res.status(resp.status).json(resp);
  });
}

module.exports = new OrderController();
