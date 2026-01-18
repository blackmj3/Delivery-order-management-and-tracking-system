const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickupAddress: {
      type: String,
      required: true,
    },
       deliveryLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    isNearNotified: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "ON_THE_WAY", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    expectedTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
); 
//To calculate distance
orderSchema.index({ deliveryLocation: "2dsphere" });

module.exports = mongoose.model("Order", orderSchema);
