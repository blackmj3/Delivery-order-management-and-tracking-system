const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinary")
const logger = require('../utils/logger');
const cache = require('../utils/cacheService');   
const responseService = require('../utils/responseService');    

class UserController{   

// get user profile

async getUserById(req, res) {
    const { id } = req.params;

    const cachedUser = await cache.get(`user_${id}`);
    if (cachedUser) {
        logger.info(`User ${id} retrieved from cache.`);
        return responseService.success(res, 200 , cachedUser);
    }

        const userId = await User.findById(id);
        
        if (!userId) {
            logger.warn(`User ${id} not found.`);
            return res.status(404).json({success : false , message : "User Not Found" });
        }

        await cache.set(`user_${id}, userId`);

        logger.info(`User ${id} retrieved from database.`);
       
        return res.status(200).json({success : true , userId});
}


// Update user profile

async updateUserProfile(req, res) {
    const { id } = req.params;
    const { name, phone, email } = req.body;

        const updateUser = await User.findById(id);

        if (!updateUser) {
            logger.warn(`User ${id} not found for update.`);
            return res.status(404).json({success : false , message : "User Not Found" });
        }

        const newUser = await User.findByIdAndUpdate(
            id,
            { name, phone, email },
            { new: true }
        );

        await cache.set(`user_${id}, newUser`);

        logger.info(`User ${id} updated successfully.`);

        return res.status(200).json({success : true , newUser});
}


// upload avatar user by multer

uploadLocalByMulter = async (req, res) => {

        if (!req.file) {
            logger.warn("File upload failed: No file selected.");
            return responseService.error(res, 400 , { message: "You must select a file." });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace('uploads/', '')}`;
        
        const { id } = req.params;
        const addUserAvatar = await User.findById(id);
        
        if (!addUserAvatar) {
            logger.warn(`User with ID ${id} not found.`);
            return res.status(404).json({success : false , data : "User Not Found" });
        }

        addUserAvatar.avatar =  fileUrl ;
        await addUserAvatar.save();

        await cache.set(`user_${id}, addUserAvatar`);

        logger.info(`Avatar uploaded successfully for user ${id}.`);
        
        return res.status(201).json({success : true , addUserAvatar});
}


// upload avatar user by cloudinary

uploadCloudByCloudinary = async (req, res) => {
    
        if (!req.file) {
            logger.warn("File upload failed: No file selected.");
            return responseService.error(res, 400 , { message: "File must be uploaded." });
        }

        const path = await uploadToCloudinary(req.file);
        
        const { id } = req.params;
        const addUserAvatarCloud = await User.findById(id);
        
        if (!addUserAvatarCloud) {
            logger.warn(`User with ID ${id} not found.`);
            return res.status(404).json({success : false , message : "User Not Found" });
        }

        addUserAvatarCloud.avatar =  path ;
        await addUserAvatarCloud.save();

        await cache.set(`user_${id}, addUserAvatarCloud`);

        logger.info(`Avatar uploaded successfully for user ${id}.`);

       return res.status(200).json({success : true , addUserAvatarCloud});
}


DeleteAvatarUser = async (req, res) => {
    
        const { id } = req.params;
        const deleteUserAvatar = await User.findById(id);
        
        if (!deleteUserAvatar) {
            logger.warn(`User with ID ${id} not found.`);
            return res.status(404).json({success : false , message : "User Not Found" });
        }

        if (!deleteUserAvatar.avatar) {
            logger.warn(`Avatar not found for user with ID ${id}.`);
            return res.status(404).json({success : false , message : "Avatar Not Found" });
        }

        deleteUserAvatar.avatar = null;
        await deleteUserAvatar.save();

        logger.info(`Avatar deleted successfully for user ${id}.`);
        
        return res.status(200).json({success : true , message : "Avatar Deleted Successfully"});
}


}
module.exports = new UserController();