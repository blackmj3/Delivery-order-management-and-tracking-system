const Rating = require("../models/Rate");
const User = require("../models/User");
const logger = require('../utils/logger');
const cache = require('../utils/cacheService');   
const responseService = require('../utils/responseService');    

class RatingController {

// add driver rating

async addDriverRating(req, res) {
    const { id } = req.params; // driverId
    let userRate = await cache.get(`driverRate_${id}`);
    
    if (!userRate) {
        userRate = await User.findById(id);
        if (!userRate || userRate.role !== "DRIVER") {
             return res.status(404).json({success : false , message : "Driver Not Found" });
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
        return responseService.error(res, 404, 'No ratings found for this driver');
    }

    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageScore = totalScore / ratings.length;
    userRate.averageRating = averageScore;
    await userRate.save();

    logger.info(`Driver ${userID} rated driver ${id} with score ${score}`);

    return res.status(200).json({success : true , userRate});
}


// get user ratings

async getuserRatings(req, res) {
        const { userId } = req.params;
        const cachedRatings = await cache.get(`userRatings:${userId}`);
        if (cachedRatings) {
            logger.info(`Retrieved ratings from cache for Driver : ${userId}`);
            return responseService.success(res, cachedRatings);
        }

            const ratings = await Rating.find({ userId }).populate("userId").populate("driverId").populate("orderId");
            if (!ratings || ratings.length === 0) {
                logger.warn(`No ratings found for Driver: ${userId}`);
                 return res.status(404).json({success : false , message : "User Do Not Write Ratings" });
            }

            await cache.set(`driverRatings:${userId}, ratings`);

            logger.info(`Retrieved ratings for Driver : ${userId}`);
            
            return res.status(200).json({success : true , ratings});
    }


// get Driver ratings

async getDriverRatings(req, res) {
        const { driverID } = req.params;
        const cachedRatings = await cache.get(`userRatings:${driverID}`);
        if (cachedRatings) {
            logger.info(`Retrieved ratings from cache for Driver : ${driverID}`);
            return responseService.success(res, cachedRatings);
        }

            const ratingsDriver = await Rating.find({ driverId : driverID }).populate("userId").populate("driverId").populate("orderId");
            if (!ratingsDriver || ratingsDriver.length === 0) {
                logger.warn(`No ratings found for Driver: ${driverID}`);
                 return res.status(404).json({success : false , message : "Driver Has Not Ratings" });
            }

            await cache.set(`driverRatings:${driverID}, ratings`);

            logger.info(`Retrieved ratings for Driver : ${driverID}`);
            
           return res.status(200).json({success : true , ratingsDriver});
    }


// update rating for driver

async updateRating(req, res) {
    const { id } = req.params;

    const updateRatingUser = await Rating.findById(id);
    if (!updateRatingUser) {
        logger.warn(`Rating with ID ${id} not found`);
         return res.status(404).json({success : false , message : "This Rating Not Found" });
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

    return res.status(200).json({success : true , message , result});
}


// delete driver rating

async deleteDriverRating(req, res) {
    const { driverId } = req.params;

    let user = await User.findById(driverId);
    if (!user || user.role !== "DRIVER") {
         return res.status(404).json({success : false , message : "Driver Not Found" });
    }

    const { ratingId } = req.body;

    const rating = await Rating.findById(ratingId);
    if (!rating || rating.driverId.toString() !== driverId) {
        return responseService.error(res, 404, 'Rating not found');
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
    
    return res.status(200).json({success : true ,message: 'Rating deleted successfully' , deleteRating});

}


}
module.exports = new RatingController();


   
