const ExcelJs = require("exceljs");
const Order = require("../models/Order");
const User = require("../models/User");
const Location = require("../models/Location");
const { exportOrdersToExcel } = require("../services/orderExport.service");
const { getOrders } = require("../services/filterService");
const { createLog } = require("../utils/ActivityLog");
const {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseService");
const cache = require("../utils/cacheService");
const logger = require("../utils/logger");

class AdminController {
  //show all orders in app (pending , accept ,delivered ,canceled)
  getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const cacheKey = `orders_page_${page}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.info("Fetching orders from cache");
      return res.status(cachedResult.status).json(cachedResult);
    }

    const result = await Order.paginate({
      filters: {},
      page: page,
      limit: limit,
    }).execPaginate();

    const resp = success(result, "Orders fetched successfully", 200);

    cache.set(cacheKey, result, 600);

    return res.status(resp.status).json(resp);
  });
  //show order by id
  getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }

    const resp = success(order, "Order fetched successfully", 200);
    return res.status(resp.status).json(resp);
  });

  //filtter the order by location ,status or driver
  getOrdersByFilter = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;

    const result = await getOrders(req.exportFilters, { page, limit });

    const resp = success(
      {
        success: true,
        total: result.total,
        page: result.page,
        pages: result.pages,
        isNext: result.isNext,
        isPrevious: result.isPrevious,
        data: result.data,
      },
      "Orders fetched successfully",
      200,
    );
    return res.status(resp.status).json(resp);
  });
  //export orders to excel
  export = asyncHandler(async (req, res) => {
    logger.info("Exporting orders to Excel");
    const filters = req.exportFilters || {};
    const workbook = await exportOrdersToExcel(req.exportFilters);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", 'attachment; filename="orders.xlsx"');
    await workbook.xlsx.write(res);
    logger.info("Excel file generated successfully");
    res.end();
  });

  //DELETE ORDER BY ID

  remove = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user ? req.user.id : null;

    const deleted = await Order.findByIdAndDelete(id, { new: true });

    if (!deleted) {
      const resp = error("Order not found", 404);
      return res.status(resp.status).json(resp);
    }
    await createLog({
      userId: adminId,
      role: req.user.role,
      orderId: id,
      action: "DELETE_ORDER",
      details: `Admin deleted order with ID: ${id}`,
    });

    logger.warn("Order deleted", { orderId: id, adminId });

    const resp = success(deleted, "Order deleted successfully", 200);
    return res.status(resp.status).json(resp);
  });

  //Update order by id

  updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const dataToUpdate = req.validatedUpdates;

    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
      const resp = error("No valid fields to update", 400);
      return res.status(resp.status).json(resp);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: dataToUpdate },
      { new: true, runValidators: true },
    ).populate("driver", "name phone");
    if (!updatedOrder) {
      const resp = error("Order not found", 404);
      return res.status(404).json(resp);
    }
    await createLog({
      userId: req.user ? req.user._id : null,
      role: req.user ? req.user.role : "ADMIN",
      orderId: updatedOrder._id,
      action: "ORDER_UPDATED",
      details: JSON.stringify({
        previousData: req.existingOrderData,
        updatedData: dataToUpdate,
      }),
    });

    logger.info("Order updated", { orderId: id, updates: dataToUpdate });

    const resp = success(updatedOrder, "Order updated successfully", 200);
    return res.status(resp.status).json(resp);
  });

  //get all users
  listUsers = asyncHandler(async (req, res) => {
    const { role, isActive, page = 1, limit = 5 } = req.query;
    const filters = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === "true";

    const users = await getUsers(filters, page, limit);

    const resp = success(users, "Users fetched successfully", 200);
    return res.status(resp.status).json(resp);
  });
  // Get user by ID
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    const resp = success(user, "User fetched successfully", 200);
    return res.status(resp.status).json(resp);
  });
  // Update user role
  changeRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await updateUserRole(id, role);
    if (!updatedUser) {
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    logger.info("User role updated", { userId: id, newRole: role });

    const resp = success(updatedUser, "User role updated successfully", 200);
    return res.status(resp.status).json(resp);
  });
  // Activate or deactivate the user

  toggleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await toggleUserStatus(id, isActive);
    if (!user) {
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    logger.info("User status toggled", { userId: id, isActive });

    const resp = success(user, "User status toggled successfully", 200);
    return res.status(resp.status).json(resp);
  });
  // Delete user
  removeUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedUser = await deleteUser(id);

    if (!deletedUser) {
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    logger.warn("User deleted", { userId: id });

    const resp = success(deletedUser, "User deleted successfully", 200);
    return res.status(resp.status).json(resp);
  });
  // Get latest driver location

  getDriverLocation = asyncHandler(async (req, res) => {
    const driverId = req.params.driverId;
    const driver = await User.findById(driverId);

    if (!driver) {
      const resp = error("driver not found", 404);
      return res.status(resp.status).json(resp);
    }
    const latestLocation = await Location.findOne({ driver: driverId })
      .sort({ createdAt: -1 })
      .populate("driver")
      .populate("order");
    if (!latestLocation) {
      const resp = error("No location found for this driver", 404);
      return res.status(resp.status).json(resp);
    }

    const resp = success(
      latestLocation,
      "Driver location fetched successfully",
      200,
    );
    return res.status(resp.status).json(resp);
  });
}
module.exports = new AdminController();
