const express = require("express") ;
const router = express.Router();
const rateController = require("../controllers/rateController") ;
// const {requireAuth ,    auhtorize} = require("../middlewares/auth") ;
const {addNewRateValidation , getByIdValidate} = require("../validation/rateValidation") ;
const asyncHandler = require("../utils/asyncHandler")
// GET 
router.get("/getTotalRating/:id"  , [ getByIdValidate] ,  asyncHandler(rateController.TotalRating)) ;
router.get("/getratinguser/:userId"  , [ getByIdValidate] ,  asyncHandler(rateController.getUserRatings)) ;

//POST
router.post("/addrate/:id" , [getByIdValidate , addNewRateValidation] , asyncHandler(rateController.DriverRating));

// PUT 
router.put("/updaterating/:id" , [ addNewRateValidation , getByIdValidate] , asyncHandler(rateController.updateRating)) ;

// DELETE 
router.delete("/deleterating/:id" , [ getByIdValidate] , asyncHandler(rateController.DeleteRating)) ;

module.exports = router ;