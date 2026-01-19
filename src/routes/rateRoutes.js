const express = require("express") ;
const router = express.Router();
const rateController = require("../controllers/rateController") ;
const { requireAuth } = require("../middlewares/authMiddleware") ;
const {addNewRateValidation , getByIdValidate} = require("../validations/rateValidation") ;


// GET 
router.get("/getratingdriver/:userId"  , [ requireAuth ,  getByIdValidate] ,  rateController.getuserRatings);

// GET 
router.get("/getratingsforthisdriver/:driverID" , [requireAuth , getByIdValidate] , rateController.getDriverRatings)

//POST
router.post("/addrate/:id" , [requireAuth , getByIdValidate , addNewRateValidation] , rateController.addDriverRating);

// PUT 
router.put("/updaterating/:id" , [requireAuth , addNewRateValidation , getByIdValidate] , rateController.updateRating) ;

// DELETE 
router.delete("/deleterating/:driverId" , [requireAuth , getByIdValidate] , rateController.deleteDriverRating) ;

module.exports = router ;