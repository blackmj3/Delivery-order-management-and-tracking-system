const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinary")
const logger = require('../utils/logger');
const cache = require('../utils/cacheService');   
const {success,error} = require('../utils/responseService');    
const asyncHandler = require("../utils/asyncHandler") ;

class UserController{   

// get user profile

 getUserById = asyncHandler (async (req, res) => {
    const { id } = req.params;

    const cachedUser = await cache.get(`user_${id}`);
    if (cachedUser) {
        logger.info(`User ${id} retrieved from cache.`);
         const respsuccache = success(cachedUser , "success", 200);
         return res.status(respsuccache.status).json(respsuccache);
    }

        const userId = await User.findById(id);
        
        if (!userId) {
            logger.error(`User ${id} not found.`);
            const resp = error("User Not Found", 404);
            return res.status(resp.status).json(resp);
        }

        await cache.set(`user_${id}, userId`);

        logger.info(`User ${id} retrieved from database.`);
       
        const respsuc = success(userId , "get user's profile successfully", 200);
        return res.status(respsuc.status).json(respsuc);
}) ;


// Update user profile

 updateUserProfile = asyncHandler (async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;

        const updateUser = await User.findById(id);

        if (!updateUser) {
            logger.error(`User ${id} not found for update.`);
            const resp = error("User Not Found", 404);
            return res.status(resp.status).json(resp);
        }

        const newUser = await User.findByIdAndUpdate(
            id,
            { name, phone, email },
            { new: true }
        ) ;

        logger.info(`User ${id} updated successfully.`);

        const respsuc = success(newUser , "Update user's profile successfully", 200);
        return res.status(respsuc.status).json(respsuc);
}) ;


// upload avatar user by multer

uploadLocalByMulter = asyncHandler  (async (req, res) => {

        if (!req.file) {
            logger.warn("File upload failed: No file selected.");
            const resperrorfile = error("You must select a file.", 404);
            return res.status(resperrorfile.status).json(resperrorfile);
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace('uploads/', '')}`;
        
        const { id } = req.params;
        const addUserAvatar = await User.findById(id);
        
        if (!addUserAvatar) {
            logger.warn(`User with ID ${id} not found.`);
            const resp = error("User Not Found", 404);
            return res.status(resp.status).json(resp);
        }

        addUserAvatar.avatar =  fileUrl ;
        await addUserAvatar.save() ;

        logger.info(`Avatar uploaded successfully for user ${id}.`);
        const respsuc = success(addUserAvatar , "Upload user's avatar by multer successfully", 200);
        return res.status(respsuc.status).json(respsuc);

}) ;


// upload avatar user by cloudinary

uploadCloudByCloudinary = asyncHandler (async (req, res) => {
    
        if (!req.file) {
            logger.warn("File upload failed: No file selected.");
            const resperrorfile = error("You must select a file.", 404);
            return res.status(resperrorfile.status).json(resperrorfile);
        }

        const path = await uploadToCloudinary(req.file);
        
        const { id } = req.params;
        const addUserAvatarCloud = await User.findById(id);
        
        if (!addUserAvatarCloud) {
            logger.warn(`User with ID ${id} not found.`);
            const resp = error("User Not Found", 404);
            return res.status(resp.status).json(resp);
        }

        addUserAvatarCloud.avatar =  path ;
        await addUserAvatarCloud.save() ;

        logger.info(`Avatar uploaded successfully for user ${id}.`);
        const respsuc = success(addUserAvatar , "Upload user's avatar by cloudinary successfully", 200);
        return res.status(respsuc.status).json(respsuc);

}) ;


DeleteAvatarUser = asyncHandler (async (req, res) => {
    
        const { id } = req.params;
        const deleteUserAvatar = await User.findById(id);
        
        if (!deleteUserAvatar) {
            logger.error(`User with ID ${id} not found.`);
            const resp = error("User Not Found", 404);
            return res.status(resp.status).json(resp);
        }

        if (!deleteUserAvatar.avatar) {
            logger.warn(`Avatar not found for user with ID ${id}.`);
            const resperroravatar = error("Avatar Not Found", 404);
            return res.status(resperroravatar.status).json(resperroravatar);
        }

        deleteUserAvatar.avatar = null;
        await deleteUserAvatar.save();

        logger.info(`Avatar deleted successfully for user ${id}.`);
        const respsuc = success(deleteUserAvatar , "Deleted user's avatar successfully", 200);
        return res.status(respsuc.status).json(respsuc);
        
}) ;


}
module.exports = new UserController();