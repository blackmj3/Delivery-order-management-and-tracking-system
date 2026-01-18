const Rating = require("../models/Rate");
const User = require("../models/User");
const logger = require('../utils/logger');
const cache = require('../utils/cacheService');   
const {success,error} = require('../utils/responseService');    
const asyncHandler = require("../utils/asyncHandler") ;

class RatingController {

// add driver rating

 addDriverRating = asyncHandler (async (req, res) => {
        const { id } = req.params; // driverId
        
         let userRate = await cache.get(`driverRate_${id}`);
    
    if (!userRate) {
        userRate = await User.findById(id);
        if (!userRate || userRate.role !== "DRIVER") {
             logger.error(`Driver ${id} not found.`);
             const resp = error("Driver Not Found", 404);
             return res.status(resp.status).json(resp);
        }
        await cache.set(`driverRate_${id}, userRate, 600`); 
    }

    const { score, comment, userID, orderID } = req.body;

    const result = await Rating.create({ score, comment, userId: userID, orderId: orderID, driverId: userRate._id });
    
    const ratings = await Rating.find({ driverId: userRate._id }).populate("userId").populate("orderId");
    
    userRate.ratingsCount = ratings.length;    
    await userRate.save();

    if (ratings.length === 0) {
        logger.info(`No ratings found for user with ID ${id}`);
        const respratelength = error("Driver Has Not Ratings", 404);
        return res.status(respratelength.status).json(respratelength);
    }

    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageScore = totalScore / ratings.length;
    userRate.averageRating = averageScore;
    await userRate.save();

    logger.info(`Driver ${userID} rated driver ${id} with score ${score}`);

    const respsuc = success( userRate , "add Driver's Rating successfully", 201);
    return res.status(respsuc.status).json(respsuc);
}) ;


// get user ratings

 getuserRatings = asyncHandler ( async (req, res) => {
        const { userId } = req.params;
        const cachedRatings = await cache.get(`userRatings:${userId}`);
        if (cachedRatings) {
            logger.info(`Retrieved ratings from cache for Driver : ${userId}`);
            const respsuccache = success(cachedRatings , "success", 200);
            return res.status(respsuccache.status).json(respsuccache);
        }

            const ratings = await Rating.find({ userId }).populate("userId").populate("driverId").populate("orderId");
            if (!ratings || ratings.length === 0) {
                logger.error(`this User ${userId} Do Not Write Ratings`);
                const respratelength = error(`this User ${userId} Do Not Write Ratings`, 404);
                return res.status(respratelength.status).json(respratelength);
            }

            await cache.set(`driverRatings:${userId}, ratings`);

            logger.info(`Retrieved ratings for Driver : ${userId}`);
 
            const respsuc = success(ratings , `get Ratings that user ${userId} wrote it successfully`, 200);
            return res.status(respsuc.status).json(respsuc);
    }) ;


// get Driver ratings

 getDriverRatings = asyncHandler ( async (req, res)  => {
        const { driverID } = req.params;
        const cachedRatings = await cache.get(`userRatings:${driverID}`);
        if (cachedRatings) {
            logger.info(`Retrieved ratings from cache for Driver : ${driverID}`);
            const respsuccache = success(cachedRatings , "success", 200);
            return res.status(respsuccache.status).json(respsuccache);
        }

            const ratingsDriver = await Rating.find({ driverId : driverID }).populate("userId").populate("driverId").populate("orderId");
            if (!ratingsDriver || ratingsDriver.length === 0) {
                logger.error(`No ratings found for Driver: ${driverID}`);
                const respratelength = error(`No ratings found for Driver: ${driverID}`, 404);
                return res.status(respratelength.status).json(respratelength);
            }

            await cache.set(`driverRatings:${driverID}, ratings`);

            logger.info(`Retrieved ratings for Driver : ${driverID}`);
            
            const respsuc = success(ratingsDriver , `get Ratings for this Driver successfully`, 200);
            return res.status(respsuc.status).json(respsuc);
    }) ;


// update rating for driver

 updateRating = asyncHandler ( async (req, res) => {
    const { id } = req.params;

    const updateRatingUser = await Rating.findById(id);
    if (!updateRatingUser) {
        logger.error(`Rating with ID ${id} not found`);
        const resp = error("This Rating Not Found", 404);
        return res.status(resp.status).json(resp);
    }

    const { score, comment } = req.body;

    const result = await Rating.findByIdAndUpdate(
        id,
        { score, comment },
        { new: true }
    ).populate("userId").populate("driverId").populate("orderId");


    const driverId = updateRatingUser.driverId; 
    const ratings = await Rating.find({ driverId }); 

    if (ratings.length > 0) {
        const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
        const averageRating = totalScore / ratings.length;

        const user = await User.findById(driverId);
        user.averageRating = averageRating;
        await user.save();
    }

    let message;
    switch (score) {
        case 5:
            message = "Excellent (Updated Rating Successfully)";
            break;
        case 4:
            message = "Very Good (Updated Rating Successfully)";
            break;
        case 3:
            message = "Good (Updated Rating Successfully)";
            break;
        case 2:
            message = "Accepted (Updated Rating Successfully)";
            break;
        case 1:
        case 0:
            message = "Bad (Updated Rating Successfully)";
            break;
        default:
            message = "Rating updated successfully";
    }

     logger.info(`Rating with ID ${id} updated successfully with score ${score}`);
     const respsuc = success({result , message} , `Updated Rating successfully`, 200);
     return res.status(respsuc.status).json(respsuc);

}) ;


// delete driver rating

 deleteDriverRating = asyncHandler ( async (req, res) => {
    const { driverId } = req.params;

    let user = await User.findById(driverId);
    if (!user || user.role !== "DRIVER") {
        logger.error("This Driver Not Found");
        const resp = error("This Driver Not Found", 404);
        return res.status(resp.status).json(resp);
    }

    const { ratingId } = req.body;

    const rating = await Rating.findById(ratingId);
    if (!rating || rating.driverId.toString() !== driverId) {
        logger.warn("This Driver Not Found");
        const resp = error("This Driver Not Found", 404);
        return res.status(resp.status).json(resp);
    }

    const deleteRating = await Rating.findByIdAndDelete(ratingId)
    .populate("userId")
    .populate("driverId")
    .populate("orderId");

    const ratings = await Rating.find({ driverId: user._id });
    user.ratingsCount = ratings.length; 

    if (ratings.length > 0) {
        const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
        user.averageRating = totalScore / ratings.length;
    } else {
        user.averageRating = 0; 
    }

    await user.save();

    logger.info(`Rating ${ratingId} deleted from user ${driverId}`);

     const respsuc = success( deleteRating , `Deleted this Rating successfully`, 200);
     return res.status(respsuc.status).json(respsuc);
});


}
module.exports = new RatingController();


   
