const mogoose = require("mogoose");
const Order = mongoose.model("Order",new mogoose.Schema({
    pickupAddress: {
      type: String,
      required: true
  },
    dropoffAddress: {
      type: String,
      required: true
  },
   description: {
     type: String,
     required: true
  },
    expectedTime: {
     type: String,
     required: true
  },
   status: {
     type: String,
     enum: ['pending', 'in_progress', 'delivered','cancelled'],
     default: 'pending'
  },
  //ref
  client: {
     type: Schema.Types.ObjectId,
     ref: 'User',
     required: true
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  }
}),
{
    timestamps: true
});
module.exports = Order;