const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street:{ 
       type: String, required: true 
    },

    city: { 
       type: String, required: true
     },

    orderId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },

});

module.exports = mongoose.model('Address', addressSchema);