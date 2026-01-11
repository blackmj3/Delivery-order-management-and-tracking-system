const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    role: {
      type: String,
      enum: ['ADMIN', 'CLIENT', 'DRIVER'],
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
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

module.exports = mongoose.model('ActivityLog', activityLogSchema);

