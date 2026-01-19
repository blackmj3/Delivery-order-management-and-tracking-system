const Rating = require("../models/Rate");
const User = require("../models/User");

const logger = require('../utils/logger');
const cache = require('../utils/cacheService');   
const { success, error } = require('../utils/responseService');    
const asyncHandler = require("../utils/asyncHandler");

class RatingController {

  // add driver rating
  addDriverRating = asyncHandler(async (req, res) => {
    const { id } = req.params; // driverId
    const cacheKey = `driverRate_${id}`;
    let userRate = await cache.get(cacheKey);

    if (!userRate) {
      userRate = await User.findById(id);
      if (!userRate || userRate.role !== "DRIVER") {
        logger.error(`Driver ${id} not found.`);
        const resp = error("Driver Not Found", 404);
        return res.status(resp.status).json(resp);
      }
      await cache.set(cacheKey, userRate, 600);
    }

    const { score, comment, userID, orderID } = req.body;

    await Rating.create({
      score,
      comment,
      userId: userID,
      orderId: orderID,
      driverId: userRate._id
    });

    const ratings = await Rating.find({ driverId: userRate._id })
      .populate("userId")
      .populate("orderId");

    userRate.ratingsCount = ratings.length;

    if (ratings.length === 0) {
      logger.info(`No ratings found for user with ID ${id}`);
      const resp = error("Driver Has No Ratings", 404);
      return res.status(resp.status).json(resp);
    }

    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    userRate.averageRating = totalScore / ratings.length;
    await userRate.save() ;

     // clear related caches
    await cache.clear(`driverRatings:${id}`);
    await cache.clear(`userRatings:${userID}`);

    logger.info(`Driver ${userID} rated driver ${id} with score ${score}`);

    const resp = success(userRate, "add Driver's Rating successfully", 201);
    return res.status(resp.status).json(resp);
  });

  // get user ratings
  getuserRatings = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const cacheKey = `userRatings:${userId}`;

    const cachedRatings = await cache.get(cacheKey);
    if (cachedRatings) {
      logger.info(`Retrieved ratings from cache for User: ${userId}`);
      const resp = success(cachedRatings, "success", 200);
      return res.status(resp.status).json(resp);
    }

    const ratings = await Rating.find({ userId })
      .populate("userId")
      .populate("driverId")
      .populate("orderId");

    if (!ratings || ratings.length === 0) {
      logger.error(`User ${userId} has no ratings`);
      const resp = error(`User ${userId} has no ratings`, 404);
      return res.status(resp.status).json(resp);
    }

    await cache.set(cacheKey, ratings, 600);

    logger.info(`Retrieved ratings for User: ${userId}`);

    const resp = success(ratings, `get Ratings that user ${userId} wrote successfully`, 200);
    return res.status(resp.status).json(resp);
  });

  // get driver ratings
  getDriverRatings = asyncHandler(async (req, res) => {
    const { driverID } = req.params;
    const cacheKey = `driverRatings:${driverID}`;

    const cachedRatings = await cache.get(cacheKey);
    if (cachedRatings) {
      logger.info(`Retrieved ratings from cache for Driver: ${driverID}`);
      const resp = success(cachedRatings, "success", 200);
      return res.status(resp.status).json(resp);
    }

    const ratingsDriver = await Rating.find({ driverId: driverID })
      .populate("userId")
      .populate("driverId")
      .populate("orderId");

    if (!ratingsDriver || ratingsDriver.length === 0) {
      logger.error(`No ratings found for Driver: ${driverID}`);
      const resp = error(`No ratings found for Driver: ${driverID}`, 404);
      return res.status(resp.status).json(resp);
    }

    await cache.set(cacheKey, ratingsDriver, 600);

    logger.info(`Retrieved ratings for Driver: ${driverID}`);

    const resp = success(ratingsDriver, "get Ratings for this Driver successfully", 200);
    return res.status(resp.status).json(resp);
  });

  // update rating for driver
  updateRating = asyncHandler(async (req, res) => {
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
    ).populate("userId driverId orderId");

    const driverId = updateRatingUser.driverId;
    const ratings = await Rating.find({ driverId });

    if (ratings.length > 0) {
      const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
      const averageRating = totalScore / ratings.length;

      const user = await User.findById(driverId);
      user.averageRating = averageRating;
      await user.save();
    }

     // clear cache
    await cache.clear(`driverRatings:${driverId}`);
    await cache.clear(`userRatings:${updateRatingUser.userId}`);

    logger.info(`Rating with ID ${id} updated successfully with score ${score}`);

    const resp = success({ result }, "Updated Rating successfully", 200);
    return res.status(resp.status).json(resp);
  });

  // delete driver rating
  deleteDriverRating = asyncHandler(async (req, res) => {
    const { driverId } = req.params;
    const { ratingId } = req.body;

    const user = await User.findById(driverId);
    if (!user || user.role !== "DRIVER") {
      logger.error("This Driver Not Found");
      const resp = error("This Driver Not Found", 404);
      return res.status(resp.status).json(resp);
    }


    const rating = await Rating.findById(ratingId);
    if (!rating || rating.driverId.toString() !== driverId) {
      logger.warn("This Rating Not Found");
      const resp = error("This Rating Not Found", 404);
      return res.status(resp.status).json(resp);
    }

    const deleteRating = await Rating.findByIdAndDelete(ratingId)
      .populate("userId driverId orderId");

    const ratings = await Rating.find({ driverId });
    user.ratingsCount = ratings.length;

    if (ratings.length > 0) {
      const totalScore = ratings.reduce((sum, r) => sum + r.score, 0);
      user.averageRating = totalScore / ratings.length;
    } else {
      user.averageRating = 0;
    }

    await user.save() ;

     // clear cache
    await cache.clear(`driverRatings:${driverId}`);
    await cache.clear(`userRatings:${rating.userId}`);

    logger.info(`Rating ${ratingId} deleted from driver ${driverId}`);

    const resp = success(deleteRating, "Deleted this Rating successfully", 200);
    return res.status(resp.status).json(resp);
  });
}

module.exports = new RatingController();

