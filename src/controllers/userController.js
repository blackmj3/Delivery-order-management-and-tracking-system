const User = require("../models/User");

const uploadToCloudinary = require("../utils/cloudinary");
const logger = require("../utils/logger");
const cache = require("../utils/cacheService");
const { success, error } = require("../utils/responseService");
const asyncHandler = require("../utils/asyncHandler");

class UserController {

  // Get user profile
  getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cachedUser = await cache.get(`user:${id}`);
    if (cachedUser) {
      logger.info("User retrieved from cache", { userId: id });
      const resp = success(cachedUser, "User retrieved successfully");
      return res.status(resp.status).json(resp);
    }

    const user = await User.findById(id);
    if (!user) {
      logger.error("User not found", { userId: id });
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    await cache.set(`user:${id}`, user, 600);

    logger.info("User retrieved from database", { userId: id });
    const resp = success(user, "User retrieved successfully");
    return res.status(resp.status).json(resp);
  });

  // Update user profile
  updateUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    const user = await User.findById(id);
    if (!user) {
      logger.error("User not found for update", { userId: id });
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, phone, email },
      { new: true }
    );

    // clear cache
    await cache.del(`user:${id}`);

    logger.info("User updated successfully", { userId: id });
    const resp = success(updatedUser, "User updated successfully");
    return res.status(resp.status).json(resp);
  });

  // Upload avatar (multer - local)
  uploadLocalByMulter = asyncHandler(async (req, res) => {
    if (!req.file) {
      logger.warn("No file uploaded");
      const resp = error("You must select a file", 400);
      return res.status(resp.status).json(resp);
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      logger.error("User not found", { userId: id });
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;

    user.avatar = fileUrl;
    await user.save();

    await cache.del(`user:${id}`);

    logger.info("Avatar uploaded locally", { userId: id });
    const resp = success(user, "Avatar uploaded successfully");
    return res.status(resp.status).json(resp);
  });

  // Upload avatar (cloudinary)
  uploadCloudByCloudinary = asyncHandler(async (req, res) => {
    if (!req.file) {
      logger.warn("No file uploaded");
      const resp = error("You must select a file", 400);
      return res.status(resp.status).json(resp);
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      logger.error("User not found", { userId: id });
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    const imageUrl = await uploadToCloudinary(req.file);

    user.avatar = imageUrl;
    await user.save();

    await cache.del(`user:${id}`);

    logger.info("Avatar uploaded to cloudinary", { userId: id });
    const resp = success(user, "Avatar uploaded successfully");
    return res.status(resp.status).json(resp);
  });

  // Delete avatar
  deleteAvatarUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      logger.error("User not found", { userId: id });
      const resp = error("User not found", 404);
      return res.status(resp.status).json(resp);
    }

    if (!user.avatar) {
      logger.warn("Avatar not found", { userId: id });
      const resp = error("Avatar not found", 404);
      return res.status(resp.status).json(resp);
    }

    user.avatar = null;
    await user.save();

    await cache.del(`user:${id}`);

    logger.info("Avatar deleted", { userId: id });
    const resp = success(user, "Avatar deleted successfully");
    return res.status(resp.status).json(resp);
  });
}

module.exports = new UserController();
