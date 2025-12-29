const Rating = require("../models/Rate");
const User = require("../models/User");

class RatingController {

    
async DriverRating(req, res) {
    const { id } = req.params;
    const userRate = await User.findById(id).populate("rating");

    if (!userRate) {
        return res.status(400).json({ Success: false, data: null });
    }

    const { score, comment, userID, orderID  , driverID} = req.body;

    const result = await Rating.create({ score, comment, userId: userID, orderId: orderID , driverId : driverID});
    const populatedRatings = await Rating.findById(result._id).populate("userId")
    .populate("driverId");

    userRate.rating.push(populatedRatings); 
    await userRate.save();  

    let message;
    if (score === 5) {
        message = "Excellent";
    } else if (score === 4) {
        message = "Very Good";
    } else if (score === 3) {
        message = "Good";
    } else if (score === 2) {
        message = "Accepted";
    } else if (score === 1 || score === 0) {
        message = "Bad";
    }

    return res.status(201).json({ Success: true, message, data: userRate });
}

async getUserRatings(req, res) {
        const { userId } = req.params;
        const ratings = await Rating.find({ userId }); 
        if (!ratings || ratings.length === 0) {
            return res.status(404).json({ Success: false, message: "No ratings found for this user." });
        }
        return res.status(200).json({ Success: true, data: ratings });
}


async TotalRating (req , res){
 const {id} = req.params;
    const AddUserRate = await User.findById(id).populate("rating");
    if(!AddUserRate){
        return res.status(400).json({Success : false , data : null})
    }
    const avg = AddUserRate.rating
    if (avg.length === 0) {
        return res.status(404).json({ message: "No ratings found for this representative" });
    }

    const totalScore = avg.reduce((sum, rating) => sum + rating.score, 0);
    const averageScore = totalScore / avg.length ;

    return res.status(200).json({ Success: true, averageScore: averageScore });    
}



async updateRating (req , res){
const {id} = req.params ;
const updateRatingUser = await Rating.findById(id);
if(!updateRatingUser){
    return res.status(400).json({Success : false , data : null})
}
   const { score, comment } = req.body;
    const result = await Rating.findByIdAndUpdate(
                id, 
                {score, comment},
                { new: true }
            );

    if (score === 5) {
        return res.status(200).json({message : "Excellent" + " " +"( Upadted Rating Successfully )" , data : result})
    }else if(score === 4){
         return res.status(200).json({message : "Very Good" + " " +"( Upadted Rating Successfully )" ,  data : result})
    }else if(score === 3){
         return res.status(200).json({message : "Good" + " " +"( Upadted Rating Successfully )" ,  data : result})
    }else if(score === 2){
         return res.status(200).json({message : "Accepted" + " " +"( Upadted Rating Successfully )",  data : result})
    }else if (score === 1 || score === 0){
         return res.status(200).json({message : "bad" + " " +"( Upadted Rating Successfully )",  data : result})
    }

}


async DeleteRating (req , res){    
            const { id } = req.params;
            const deleterating =  await Rating.findByIdAndDelete(id);
            return res.status(200).json({
                message: "Deleted Rating Successfully", data : deleterating
            })
}

}
module.exports = new RatingController();


   
