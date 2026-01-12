const express = require("express") ;
const router = express.Router();
const userController = require("../controllers/userController") ;
// const {requireAuth ,    auhtorize} = require("../middlewares/auth") ;
const uploadLocal = require("../middlewares/uploadMiddleware");
const multer = require("multer");
const {addNewUserValidation , getByIdValidate} = require("../validations/userValidation") ;
const asyncHandler = require("../utils/asyncHandler")

// need requireAuth Middleware for all APIS

// GET 
router.get("/profile/:id" , [getByIdValidate]  , asyncHandler(userController.getUserById)) ;


//POST

router.post("/local/:id" , [getByIdValidate ,  uploadLocal.single("image")], asyncHandler(userController.uploadLocalByMulter));
router.post("/cloud/:id", [getByIdValidate , multer().single("image")] , asyncHandler(userController.uploadCloudByCloudinary));


// PUT 
router.put("/updateprofile/:id" , [getByIdValidate , addNewUserValidation] , asyncHandler(userController.updateUserProfile));

// DELETE 
router.delete("/deleteavatar/:id" , [getByIdValidate] , asyncHandler(userController.DeleteAvatarUser));

module.exports = router ;
