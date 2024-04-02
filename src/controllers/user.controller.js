import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadImageToBucket} from "../utils/s3FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const getAccessAndRefreshToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken =  await user.generateAccessToken();
        const refreshToken =  await user.generateRefreshToken();

        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};
    }
    catch(err) {
        throw new ApiError(400, "Error while genarating token "+err);
    }
}

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

const userLogin = asyncHandler(async (req,res,next)=>{
    try {
        const {username, email, password} = req.body;
    
        if(!username && !email) throw new ApiError(400, "Username or email is required");
        if(!password) throw new ApiError(400, "Password is required");
    
        const user = await User.findOne({
            $or : [{username},{email}]
        });
    
        if(!user) throw new ApiError(404, "User not registered");
    
        const isPasswordCorrect = await user.isPasswordCorrect(password.toString());
    
        if(!isPasswordCorrect) throw new ApiError(401, "Invalid password");
    
        const {accessToken, refreshToken} = await getAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
        
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    loggedInUser,
                    accessToken,
                    refreshToken
                },"User logged In successfully")
        );
    } catch (error) {
        console.log(error);
        next(error);
    }

});

const userLogout = asyncHandler(async (req,res, next)=>{
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken : null
                }
            },
            {
                new: true
            }
        );
    
        const options = {
            httpOnly: true,
            secure: true
        };
    
        return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout successfully"));
    } catch (error) {
        console.log(error);
        next(error)
    }
});

const userRefreshAccessToen = asyncHandler(async (req,res,next)=>{
    const incomingRefreshToken = req?.cookies?.refreshToken || req.body?.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(401, "Missing refresh token");

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedRefreshToken?._id);
    
        if(!user) throw new ApiError(401, "Invalid refresh token");
    
        if(user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Refresh token didnot match");
    
        const {accessToken, refreshToken: newRefreshToken} = await getAccessAndRefreshToken(user._id);
        
        const options = {
            httpOnly: true,
            secure: true
        };

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid message")
    }

});

const userChangePassword = asyncHandler(async (req,res,next)=>{
    const {oldPassword, newPassword, confirmPassword} = req?.body;

    const user = User.findById(req.user?._id);
    if(!user) throw new ApiError(404, "User not found");

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect) throw new ApiError(400, "Old password is not correct");

    if(newPassword !== confirmPassword) throw new ApiError(400, "New password & confirm password didnot match");

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
})

export {userRegister, userLogin, userLogout, userRefreshAccessToen, userChangePassword};