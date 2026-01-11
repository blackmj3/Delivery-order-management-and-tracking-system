const ExcelJs = require('exceljs');
const Order =require ('../models/Order');
const User = require('../models/User');
const Location = require('../models/Location');
const { exportOrdersToExcel } = require('../../services/orderExport.service');
const {getOrders}= require ('../../services/filterService');
const {createLog}=require('../utils/ActivityLog');
const { getUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser } = require('../../services/userService');

class AdminController {
    //show all orders in app (pending , accept ,delivered ,canceled)
    async getAllOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const result = await Order
            .paginate({ page, limit })
            .execPaginate();

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
    //show order by id
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            return res.status(200).json({ success: true, data: order });
        } catch (error) {
             res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    //filtter the order by location ,status or driver
    async getOrdersByFilter(req, res){
     try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;

        const result = await getOrders(
            req.exportFilters,
            { page, limit }
        );

        res.status(200).json({
            success: true,
            total: result.total,
            page: result.page,
            pages: result.pages,
            isNext: result.isNext,
            isPrevious: result.isPrevious,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}
     //export orders to excel
     async export(req, res){
            try {
                const workbook = await exportOrdersToExcel(req.exportFilters);

                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=orders.xlsx'
                );
                await workbook.xlsx.write(res);
                res.end();
            } catch (error) {
                res.status(500).json({ success: false, message: 'Server error' });
        }
     }

    //DELETE ORDER BY ID 

    async remove(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;

            const deleted = await Order.findByIdAndDelete(id, { new: true });

            if(!deleted) {
                return res.status(404).json({
                    success: false,
                    data: null,
                });
            }
            await createLog({ 
                userId:adminId ,
                role: req.user.role,
                orderId: id, 
                action: 'DELETE_ORDER', 
                details: `Admin deleted order with ID: ${id}`
        });
            return res.status(200).json({
                success: true,
                data: deleted,
            });            
            

        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
    //Update order by id

    async updateOrder(req, res) {
        try {
            const { id } = req.params;

            const dataToUpdate = req.validatedUpdates;

            if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Data to update is required'
                });
            }

            const updatedOrder = await Order.findByIdAndUpdate(
                id, 
                { $set: dataToUpdate },
                { new: true, runValidators: true }
            ).populate('driver', 'name phone'); 
            if (!updatedOrder) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'The order with the specified ID was not found'
                });
            }
            await createLog({
                userId: req.user._id,
                role: req.user.role,
                orderId: updatedOrder._id,
                action: 'ORDER_UPDATED',
                details:{updatedFields: dataToUpdate} 
            });
            return res.status(200).json({
                success: true,
                message: 'Update successful',
                data: updatedOrder
            });

        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }

    //get all users 
    async listUsers(req, res) {
        try{ 
          const {role ,isActive,page =1 , limit = 5}=req.query;
          const filters = {};
          if (role) filters.role = role;
          if (isActive !== undefined) filters.isActive = isActive === 'true';

          const users = await getUsers(filters, page, limit);
          res.status(200).json({ success: true, ...users });
        } catch (error){
          res.status(500).json({ success: false, message: 'Server error' });
        }
    }
    // Get user by ID 
    async getUserById(req, res) {
        try {
            const {id }=  req.params;
            const user = await getUserById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });    
        }
    }

    // Update user role
    async changeRole (req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            const updatedUser = await updateUserRole(id, role);
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Activate or deactivate the user

    async toggleStatus (req, res) {
        try {
            const {id}=req.params;
            const{isActive}=req.body;

            const user = await toggleUserStatus(id, isActive);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Delete user
    async removeUser (req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await deleteUser(id);
            if (!deletedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get latest driver location

    async getDriverLocation(req, res) {
    const driverId = req.params.driverId;
    const driver = await User.findById(driverId);

    if (!driver) {
      error(res, "driver not found", 404, driver);
    }
    const latestLocation = await Location.findOne({ driver: driverId })
      .sort({ createdAt: -1 })
      .populate("driver")
      .populate("order");
    if (!latestLocation) {
      return error(res, "No location found for this driver", 404);
    }

    success(res, latestLocation, "Latest driver location retrieved", 200);
  }
};


module.exports = new AdminController ;



