const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({

    score: { 
        type: Number
       , min: 0 ,
        max: 5 , 
        required: true 
    },

    comment: {
        type: String ,
         default: '' 
        } ,
    
    userId :{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User",
        required: true
    },

     driverId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User",
        required: true
    },
    
    orderId : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Order",
        required: true,
        unique: true
    
    }
     
} , {timestamps : true});

const Rating = mongoose.model("Rating", ratingSchema) 

module.exports = Rating ;
