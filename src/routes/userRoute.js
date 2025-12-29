const express = require("express") ;
const router = express.Router();
const userController = require("../controllers/userController") ;
// const {requireAuth ,    auhtorize} = require("../middlewares/auth") ;
const uploadLocal = require("../middlewares/uploadMiddleware");
const multer = require("multer");
const {addNewUserValidation , getByIdValidate} = require("../validation/userValidation") ;
const asyncHandler = require("../utils/asyncHandler")

// need requireAuth Middleware for all APIS

// GET 
router.get("/profile/:id" , [getByIdValidate]  , asyncHandler(userController.getUserById)) ;
router.get("/admin/all" ,  asyncHandler(userController.getAllUser)); // [auhtorize("Admin")] Middleware

//POST
router.post("/adduser"  , [addNewUserValidation] ,  asyncHandler(userController.addUser));
router.post("/local/:id", uploadLocal.single("image"), asyncHandler(userController.uploadLocalByMulter));
router.post("/cloud/:id", multer().single("image") , asyncHandler(userController.uploadCloudByCloudinary))
router.post("/addlocationdriver/:id" ,  [getByIdValidate] ,  asyncHandler(userController.AddLocationForDriver)); // [auhtorize("Admin")] Middleware

// PUT 
router.put("/updateprofile/:id" , [getByIdValidate] , asyncHandler(userController.updateUserProfile)) ;
router.put("/role/:id" , [ getByIdValidate ] , asyncHandler(userController.changeRole)); // [auhtorize("Admin")] Middleware

// DELETE 
router.delete("/deleteuser/:id" , [getByIdValidate] , asyncHandler(userController.DeleteUser)); // [auhtorize("Admin")] Middleware

module.exports = router ;
