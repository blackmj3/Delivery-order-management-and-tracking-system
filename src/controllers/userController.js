const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinary")

class UserController{

async addUser(req, res) {

        const { name, phone } = req.body;
        
        const userProfile = await User.create({ 
            name, 
            phone
        });

        return res.status(201).json({success: true,data: userProfile});
}
   

async getAllUser (req , res){
    const getUsers = await User.find().populate("rating");
    return res.status(200).json({success : true , data : getUsers})
}

async getUserById (req , res){
    const {id} = req.params;
    const userId = await User.findById(id).populate("rating");
    if(!userId){
        return res.status(404).json({success : false , data : null });
    }
    return res.status(200).json({success : true , data : userId})
}


async updateUserProfile(req, res) {

            const { id } = req.params;

            const { name , phone } = req.body;

            const updateUser = await User.findById(id);

            if(!updateUser) {
                return res.status(404).json({success: false , data: null });
            }

            const newUser = await User.findByIdAndUpdate(
                id, 
                {name , phone},
                { new: true }
            );

            return res.status(200).json({success: true , data: newUser});
    }

    
 async changeRole(req , res) {
            const {id} = req.params ;
            const userrole = await User.findById(id)
            if(!userrole){
               return res.status(404).json({success : false , user : null})
            }
            const { userRoleChange } = req.body ;
            userrole.role = userRoleChange  ;
            return res.status(200).json({message : "the role of user change successfully" , data : userrole})
        }



        uploadLocalByMulter = async(req, res) => {
        if(!req.file) {
            throw new Error("You Must Select file");
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace('uploads/', '')}`;
        
         const {id} = req.params;
         const AddUserAvatar = await User.findById(id);
        if(!AddUserAvatar){
          return res.status(400).json({Success : false , data : null})
        }

        AddUserAvatar.avatar = [...AddUserAvatar.avatar , fileUrl];
        await AddUserAvatar.save();
        return res.status(201).json({Success : true , data : AddUserAvatar})

    }


    uploadCloudByCloudinary = async(req, res) => {
        if(!req.file) {
            throw new Error("File Must be uploaded")
        }

        const path = await uploadToCloudinary(req.file)
        
        const {id} = req.params;
         const AddUserAvatarCloud = await User.findById(id);
        if(!AddUserAvatarCloud){
          return res.status(400).json({Success : false , data : null})
        }

        AddUserAvatarCloud.avatar = [...AddUserAvatarCloud.avatar , path];
        await AddUserAvatarCloud.save();
        return res.status(201).json({Success : true , data : AddUserAvatarCloud})

    }


    async DeleteUser (req , res){
        const { id } = req.params;
        const deleteuser =  await User.findByIdAndDelete(id);
        return res.status(200).json({message: "Deleted User Successfully", data : deleteuser })
    }

    async AddLocationForDriver (req , res){
        const {id} = req.params ;
        const locationUser = await User.findById(id);
        if(!locationUser){
            return res.status(400).json({Success : false , data : null})
        }
        const {locationId} = req.body;
        locationUser.location = [...locationUser.location , locationId]
        await locationUser.save();
        return res.status(201).json({message : "Add Location Successfully" , data : locationUser })
    }
    
}
module.exports = new UserController();