const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    pickupAddress: {
      type: String,
      required: true
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },

    expectedTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);