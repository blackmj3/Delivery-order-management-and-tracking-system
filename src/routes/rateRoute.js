const express = require("express") ;
const router = express.Router();
const rateController = require("../controllers/rateController") ;
// const {requireAuth ,    auhtorize} = require("../middlewares/auth") ;
const {addNewRateValidation , getByIdValidate} = require("../validations/rateValidation") ;
const asyncHandler = require("../utils/asyncHandler")
// GET 
router.get("/getratingdriver/:userId"  , [ getByIdValidate] ,  asyncHandler(rateController.getuserRatings));

// GET 
router.get("/getratingsforthisdriver/:driverID" , [getByIdValidate] , asyncHandler(rateController.getDriverRatings))

//POST
router.post("/addrate/:id" , [getByIdValidate , addNewRateValidation] , asyncHandler(rateController.addDriverRating));

// PUT 
router.put("/updaterating/:id" , [ addNewRateValidation , getByIdValidate] , asyncHandler(rateController.updateRating)) ;

// DELETE 
router.delete("/deleterating/:driverId" , [ getByIdValidate] , asyncHandler(rateController.deleteDriverRating)) ;

module.exports = router ;