const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    comment: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
