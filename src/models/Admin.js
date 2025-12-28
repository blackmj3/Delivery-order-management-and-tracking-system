const mongoose = require('mongoose');
const User = require ('');
const Order = require ('');
const LogSchema = new mongoose.Schema({
 admainId: {
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

module.exports = mongoose.model('Admin', LogSchema); 