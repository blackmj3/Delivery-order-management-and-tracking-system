const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({

    score: { 
        type: Number
       , min: 1 ,
        max: 5 , 
        required: true 
    },

    comment: {
        type: String ,
         default: '' 
        } ,
    
    userId : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    }] ,

     driverId : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "User"
    }] ,
    
    orderId : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Order"
    }]
        
} , {timestamps : true});

const Rating = mongoose.model("Rating", ratingSchema) 

module.exports = Rating ;