import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


const verifyJwt = asyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(' ')[1];
    
        if(!token) throw new ApiError(401, "Unauthorized token");
    
        const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded_token?._id).select("-password -refreshToken");
    
        if(!user) throw new ApiError(401, "Invalid access token");
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, "Invalid token");
        // next(error);
    }
});

export {verifyJwt}