import {asyncHandler} from "../utils/asyncHandler.js";

const userRegister = asyncHandler(async (req,res,next)=>{
    res.status(200).json({
        message: "Good job"
    })
});

export {userRegister};