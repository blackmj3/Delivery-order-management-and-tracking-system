const ExcelJS = require("exceljs");
const Order = require("../models/Order");

const exportOrdersToExcel = async (filters = {}) => {
  const orders = await Order.find(filters).lean().populate("driver", "name");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Orders");

  sheet.columns = [
    { header: "Order ID", key: "_id", width: 30 },
    { header: "Status", key: "status", width: 15 },
    { header: "City", key: "pickupAddress", width: 20 },
    { header: "Driver", key: "driver", width: 20 },
    { header: "Created At", key: "createdAt", width: 20 },
  ];

  orders.forEach((order) => {
    sheet.addRow({
      _id: order._id,
      status: order.status,
      pickupAddress: order.pickupAddress,
      driver: order.driver?.name || "—",
      createdAt: order.createdAt
        ? new Date(order.createdAt).toISOString().split("T")[0]
        : "no date",
    });
  });

  return workbook;
};

module.exports = { exportOrdersToExcel };
