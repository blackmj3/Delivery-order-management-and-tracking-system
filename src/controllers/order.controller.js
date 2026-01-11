const Order = require("../models/Order");
const cache = require("../utils/cacheService");
const logger = require("../utils/logger");
const { success, error } = require("../utils/responseService");

class OrderController {

  // Create Order
  async createOrder(req, res) {
    const { pickupAddress, description, expectedTime, deliveryLocation } = req.body;
    const userId = req.user._id || req.user.id;

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
      pickupAddress,
      description,
      expectedTime,
      deliveryLocation,
    });

    logger.info("Order created", { orderId: order._id, clientId: userId });

    const resp = success(order, "Order created successfully", 201);
    return res.status(resp.status).json(resp);
  }

  // Get My Orders
  async getMyOrders(req, res) {
    const userId = req.user._id || req.user.id;
    const cacheKey = `my-orders:${userId}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    let filter = {};
    if (req.user.role === "CLIENT") filter.client = userId;
    if (req.user.role === "DRIVER") filter.driver = userId;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("client", "name email")
      .populate("driver", "name");

    const resp = success(orders);
    cache.set(cacheKey, resp, 60);

    return res.status(resp.status).json(resp);
  }

  // Get Open Orders
  async getOpenOrders(req, res) {
    const orders = await Order.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .populate("client", "name");

    const resp = success(orders);
    return res.status(resp.status).json(resp);
  }

  // Accept Order
  async acceptOrder(req, res) {
    const userId = req.user._id || req.user.id;
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

    logger.info("Order accepted", { orderId: order._id, driverId: userId });

    const resp = success(order, "Order accepted successfully");
    return res.status(resp.status).json(resp);
  }

  // Update Order Status
  async updateOrderStatus(req, res) {
    const userId = req.user._id || req.user.id;
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

    logger.info("Order status updated", { orderId: order._id, status });

    const resp = success(order, "Order status updated successfully");
    return res.status(resp.status).json(resp);
  }

  // Get Order By ID
  async getOrderById(req, res) {
    const userId = req.user._id || req.user.id;

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

    const resp = success(order);
    return res.status(resp.status).json(resp);
  }
}

module.exports = new OrderController();
