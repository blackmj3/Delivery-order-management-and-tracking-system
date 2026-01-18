const express = require("express") ;
const router = express.Router();
const userController = require("../controllers/userController") ;
const { requireAuth } = require("../middlewares/authMiddleware") ;
const uploadLocal = require("../middlewares/uploadMiddleware");
const multer = require("multer");
const {addNewUserValidation , getByIdValidate} = require("../validations/userValidation") ;


// GET 
router.get("/profile/:id" , [requireAuth , getByIdValidate] , userController.getUserById) ;

//POST
router.post("/local/:id" , [requireAuth , getByIdValidate ,  uploadLocal.single("image")], userController.uploadLocalByMulter);
router.post("/cloud/:id", [requireAuth , getByIdValidate , multer().single("image")] , userController.uploadCloudByCloudinary);

// PUT 
router.put("/updateprofile/:id" , [requireAuth , getByIdValidate , addNewUserValidation] , userController.updateUserProfile);

// DELETE 
router.delete("/deleteavatar/:id" , [requireAuth , getByIdValidate] , userController.DeleteAvatarUser);

module.exports = router ;
