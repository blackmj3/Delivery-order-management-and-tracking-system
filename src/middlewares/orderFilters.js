const mongoose = require('mongoose');
const Order = require('../models/Order');

const validateOrderFilters = (req, res, next) => {
    const { deliveryAddress, status, driver ,from ,to } = req.query;
    const filters = {};

    // deliveryAddress (city) filter
    if (deliveryAddress && typeof (deliveryAddress) !== 'string') {
        return res.status(400).json({ error: "city must be a string" });
    }
    if (deliveryAddress)
       {filters.deliveryAddress = {
        $regex: deliveryAddress,
        $options: 'i' 
    };
  }
    // status filter ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
    if (status) {
        const Status = Order.schema.path('status').enumValues; 
        const allowedStatuses = status.toUpperCase();
        if (typeof status !== 'string' || !Status.includes(allowedStatuses)) {
            return res.status(400).json({ 
                error: `status must be one of the following: ${Status.join(', ')}`
            });
        }
        filters.status = allowedStatuses;
    }

    // driverId filter
    if (driver && !mongoose.Types.ObjectId.isValid(driver)) {
        return res.status(400).json({ error: "driverId is not a valid ObjectId" });
    }
    if (driver) filters.driver = driver;

   // date range 
   if ((from && !to) || (!from && to)) {
    return res.status(400).json({ error: 'Both from and to dates must be provided' });
  }
  if (from && to) {
    if (isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    filters.createdAt = { $gte: new Date(from), $lte: new Date(to) };
  }

    req.exportFilters = filters;

    next();
};
module.exports = {validateOrderFilters};