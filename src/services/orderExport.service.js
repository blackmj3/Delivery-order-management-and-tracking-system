const ExcelJS = require('exceljs');
const Order = require('../models/Order');

const exportOrdersToExcel = async (filters) => {
  const orders = await Order.find(filters)
    .populate({ path: 'driver', model: 'User', select: 'name phone' });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Orders');

  sheet.columns = [
    { header: 'Order ID', key: '_id', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'City', key: 'deliveryAddress', width: 20 },
    { header: 'Driver', key: 'driver', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  orders.forEach(order => {
    sheet.addRow({
      _id: order._id,
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      driver: order.driver?.name || '—',
      createdAt: order.createdAt.toLocaleDateString(),
    });
  });

  return workbook;
};

module.exports = { exportOrdersToExcel };
