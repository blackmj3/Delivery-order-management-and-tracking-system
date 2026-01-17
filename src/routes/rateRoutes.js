const express = require("express") ;
const router = express.Router();
const rateController = require("../controllers/rateController") ;
const { requireAuth } = require("../middlewares/authMiddleware") ;
const {addNewRateValidation , getByIdValidate} = require("../validations/rateValidation") ;
const asyncHandler = require("../utils/asyncHandler") ;

// GET 
router.get("/getratingdriver/:userId"  , [ requireAuth ,  getByIdValidate] ,  asyncHandler(rateController.getuserRatings));

// GET 
router.get("/getratingsforthisdriver/:driverID" , [requireAuth , getByIdValidate] , asyncHandler(rateController.getDriverRatings))

//POST
router.post("/addrate/:id" , [requireAuth , getByIdValidate , addNewRateValidation] , asyncHandler(rateController.addDriverRating));

// PUT 
router.put("/updaterating/:id" , [requireAuth , addNewRateValidation , getByIdValidate] , asyncHandler(rateController.updateRating)) ;

// DELETE 
router.delete("/deleterating/:driverId" , [requireAuth , getByIdValidate] , asyncHandler(rateController.deleteDriverRating)) ;

module.exports = router ;