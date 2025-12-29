const {body, param} = require("express-validator") ;


const addNewRateValidation = [
    
     body("comment")
     .isString()
     .withMessage("comment must be string").bail() ,
     
     body("score")
     .isNumeric()
     .withMessage("score must be number").bail() 
]

const getByIdValidate = [
    param("id")
    .isString().withMessage("Id must be string")
    .isMongoId().withMessage("Invalid Id Format")
]

module.exports = {addNewRateValidation , getByIdValidate} ;
