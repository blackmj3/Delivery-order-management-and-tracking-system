const Order = require('../models/Order');

const getOrders = async (filters, { page, limit }) => {
  const query = Order.paginate({
    filters,
    page,
    limit
  });

  const result = await query.execPaginate();

  return result;
};

module.exports = {getOrders};
