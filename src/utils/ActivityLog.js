const admin = require('../models/Admin');

const createLog=async({userId,role,orderId,action,details})=>{

    try {
        await ActivityLog.create({

            userId,
            role,
            orderId,
            action,
            details});
    } catch (err) {
        console.error('log failed :',err);
    }
};

module.exports={createLog};