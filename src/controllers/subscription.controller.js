import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async(req,res,next)=>{
    try {
        const {channelId} = req.params;
        const userId = req?.user._id;
        if(!userId) throw new ApiError(400, "Please login");
        if(!channelId) throw new ApiError(400, "Wrong channelId");

        if(userId.toString() === channelId) throw new ApiError(400, "You cannot subscribe to your own channel");
    
        const subscription = await Subscription.findOne(
            {subscriber: userId},
            {channel: channelId}
        );
    
        if (subscription) {
            const unsubscribing = await Subscription.deleteOne({ _id: subscription._id });
    
            if(!unsubscribing) throw ApiError(400, "Error while unsubscribing");
    
            return res
            .status(200)
            .json(new ApiResponse(200, unsubscribing, "Unsubscribed successfully"));
        } else {
            const subscribing = await Subscription.create({ subscriber: userId, channel: channelId });
    
            if(!subscribing) throw ApiError(400, "Error while subscribing");
    
            return res
            .status(200)
            .json(new ApiResponse(200, subscribing, "Subscribed successfully"));
        }
    } catch (error) {
        console.log("Something went wrong "+ error)
        next(error)
    }
});

// Get all subscribers subscribed to ur channel
const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
    try {
        const channelId = req.user?._id;
        if(!channelId) throw new ApiError(400, "Channel Id is missing");

        const userList = await Subscription.find({
            channel: channelId
        }).select("subscriber");

        if(userList.length === 0){
            return res
            .status(200)
            .json(new ApiResponse(200, userList, "No subscribers found"));
        }else{
            return res
            .status(200)
            .json(new ApiResponse(200, userList, "Subscribers fetched successfully"));
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
})

// Get all channels u have subscried to
const getSubscribedChannels = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if(!userId) throw new ApiError(400, "Channel Id is missing");

        const userList = await Subscription.find({
            subscriber: userId
        }).select("channel");

        if(userList.length === 0){
            return res
            .status(200)
            .json(new ApiResponse(200, userList, "No channels subscribed"));
        }else{
            return res
            .status(200)
            .json(new ApiResponse(200, userList, "Fetched all subscribed channels successfully"));
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};