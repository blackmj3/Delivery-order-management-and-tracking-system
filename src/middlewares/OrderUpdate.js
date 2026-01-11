const mongoose = require('mongoose');
const Order = require('../models/Order'); 
const User = require('../models/User');

const validateOrderUpdate = async (req, res, next) => {

    const { status, driver } = req.body;
    const updates = {};

    if (status) {
        const allowedStatuses = Order.schema.path('status').enumValues; 
        
        if (typeof status !== 'string' || !allowedStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({ 
                error: `must be one of ${allowedStatuses.join(', ')}`}); 
        }
        updates.status = status.toUpperCase();
    }

    if (driver) {

        if (!mongoose.Types.ObjectId.isValid(driver)) {
            return res.status(400).json({ error: 'driverId is not a valid ObjectId' });
        }
        const driver = await User.findOne({ _id: driver, role: 'DRIVER' });
        
        if (!driver) {
            return res.status(404).json({ 
                error:'the specified driverId does not correspond to a valid driver'
                        });
        }
        updates.driverId = driverId;
    }

    req.validatedUpdates = updates;
    next();
};

module.exports = { validateOrderUpdate };