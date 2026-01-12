const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter ({
    windowMs : 15 * 60 * 1000 ,
    max : 100 ,
    message : {
        error : "Too many request from this IP , please Try again"
    } ,
    // standardHeader : true 
})

const loginLimiter = rateLimiter ({
    windowMs : 15 * 60 * 1000 ,
    max : 5 ,
    message : {
        error : "Too many request from this IP , please Try again"
    } ,
    // standardHeader : true 
})

module.exports = {apiLimiter , loginLimiter} ;