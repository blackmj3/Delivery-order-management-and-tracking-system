const express = require('express');
const router = express.Router();
const AdminController=require('../controllers/adminController');
const {validateOrderUpdate}=require('../middlewares/OrderUpdate');
const {validateOrderFilters} = require('../middlewares/orderFilters');
const {validateUserRole} = require('../middlewares/validateUserRole');

//Order
router.get('/admin/ordersall', AdminController.getAllOrders);

router.get('/admin/orders',validateOrderFilters , AdminController.getOrdersByFilter);

router.get('/admin/orders/export',validateOrderFilters, AdminController.export);

router.delete('/admin/order/:id', AdminController.remove);

router.put('/admin/order/:id', validateOrderUpdate , AdminController.updateOrder);

//User
router.get('/admin/users',validateUserRole, AdminController.listUsers);

router.get('/admin/user/:id',validateUserRole, AdminController.getUserById);

router.put('/admin/user/:id/role',validateUserRole, AdminController.changeRole);

router.put('/admin/user/:id/status',validateUserRole, AdminController.toggleStatus);

router.delete('/admin/user/:id',validateUserRole, AdminController.removeUser);

//location 

router.get("/driver/:driverId/latest",asyncHandler(AdminController.getDriverLocation));

module.exports = router;
