const {body, param} = require("express-validator") ;
const User = require("../models/User");

const addNewUserValidation = [
    
     body("name")
     .isString()
     .withMessage("name must be string").bail() ,
     
     body("phone")
     .isNumeric()
     .withMessage("phone must be number").bail() 
]

const getByIdValidate = [
    param("id")
    .isString().withMessage("Id must be string")
    .isMongoId().withMessage("Invalid Id Format")
]

module.exports = {addNewUserValidation , getByIdValidate} ;
