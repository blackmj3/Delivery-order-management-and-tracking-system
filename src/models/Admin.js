const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },

    action: {
      type: String,
      required: true
    },

    details: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminLog', adminLogSchema);
