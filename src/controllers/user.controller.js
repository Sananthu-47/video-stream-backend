import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadImageToBucket} from "../utils/s3FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userRegister = asyncHandler(async (req,res,next)=>{
    try{
        const {fullName, email, password, username} = req.body;

        if([fullName,email,password,username].some((field)=> field === "" || field === null || field === undefined)) throw new ApiError(400,"All mandatory fields are required");
        
        const existedUser = await User.findOne({
            $or: [{email},{username}]
        })

        if(existedUser) throw new ApiError(409, "User already registered");

        let avatarPath;
        let coverImagePath;

        if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
            avatarPath = req.files.avatar[0].path;

        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
            coverImagePath = req.files.coverImage[0].path;

        if(!avatarPath) throw new ApiError(400, "Avatar field is required");


        const avatarImage = await uploadImageToBucket(avatarPath,"avatars");
        const coverImage = await uploadImageToBucket(coverImagePath,"cover-images");

        if(!avatarImage) throw new ApiError(400, "Avatar Image is required");

        const user = await User.create({
            fullName,
            email,
            password,
            username:username.toLowerCase(),
            avatar: avatarImage?.url,
            coverImage: coverImage?.url || ''
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser) throw new ApiError(500, "Something went wrong while creating user");

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
    }
    catch(err) {
        next(err);
    }
});

export {userRegister};