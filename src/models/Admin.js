const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
 adminId: {
   type: mongoose.Schema.Types.ObjectId,
   ref : 'User',
 },
 orderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Order',
 },
 action :{
  type: String,
  required : true
 },
 details :  {
  type: String,
  required : true
 }
});

module.exports = mongoose.model('AdminLog', LogSchema); 
