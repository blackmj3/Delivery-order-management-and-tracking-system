const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/adminController");
const { validateOrderUpdate } = require("../middlewares/OrderUpdate");
const { validateOrderFilters } = require("../middlewares/orderFilters");
const { validateUserRole } = require("../middlewares/validateUserRole");
const { requireAuth, authorize } = require("../middlewares/authMiddleware");

//Order
router.get("/ordersall", AdminController.getAllOrders);

router.get("/orders", [validateOrderFilters], AdminController.getOrdersByFilter);

router.get("/orders/export", validateOrderFilters, AdminController.export);

router.get("/orders/:id", [validateOrderFilters], AdminController.getOrderById);

router.delete("/order/:id", AdminController.remove);

router.put("/order/:id", [validateOrderUpdate], AdminController.updateOrder);

//User

router.get("/users", AdminController.listUsers);

router.get("/user/:id", AdminController.getUserById);

router.put("/user/role/:id", [validateUserRole], AdminController.changeRole);

router.put("/user/:id/status", [validateUserRole], AdminController.toggleStatus);

router.delete("/user/delete/:id", AdminController.removeUser);

//location

router.get("/driver/:driverId/latest", AdminController.getDriverLocation);

module.exports = router;
