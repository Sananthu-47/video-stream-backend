import {Like} from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req,res,next)=>{
    try {
        const {videoId} = req.params;
        const likedBy = req.user?._id;
        if(!videoId) throw new ApiError(400, "Video id is missing");
        if(!likedBy) throw new ApiError(400, "Please login to like");
        
        const like = await Like.find({
            videoId,
            likedBy
        });

        if(like.length > 0) {
            const deleteLike = await Like.deleteOne(like._id);
            return res
            .status(200)
            .json(new ApiResponse(200, deleteLike, "Video unliked successfully"));
        }else{
            const videoLike = await Like.create({
                videoId,
                likedBy
            });
            return res
            .status(200)
            .json(new ApiResponse(200, videoLike, "Video liked successfully"));
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
});

const toggleCommentLike = asyncHandler(async (req,res,next)=>{
    try {
        const {commentId} = req.params;
        const likedBy = req.user?._id;
        if(!commentId) throw new ApiError(400, "Comment id is missing");
        if(!likedBy) throw new ApiError(400, "Please login to like");
        
        const like = await Like.find({
            commentId,
            likedBy
        });

        if(like.length > 0) {
            const deleteLike = await Like.deleteOne(like._id);
            return res
            .status(200)
            .json(new ApiResponse(200, deleteLike, "Comment unliked successfully"));
        }else{
            const commentLike = await Like.create({
                commentId,
                likedBy
            });
            return res
            .status(200)
            .json(new ApiResponse(200, commentLike, "Comment liked successfully"));
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
});

const togglePostLike = asyncHandler(async (req,res,next)=>{
    try {
        const {postId} = req.params;
        const likedBy = req.user?._id;
        if(!postId) throw new ApiError(400, "Post id is missing");
        if(!likedBy) throw new ApiError(400, "Please login to like");
        
        const like = await Like.find({
            postId,
            likedBy
        });

        if(like.length > 0) {
            const deleteLike = await Like.deleteOne(like._id);
            return res
            .status(200)
            .json(new ApiResponse(200, deleteLike, "Post unliked successfully"));
        }else{
            const postLike = await Like.create({
                postId,
                likedBy
            });
            return res
            .status(200)
            .json(new ApiResponse(200, postLike, "Post liked successfully"));
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
});

const getLikedVideos = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user._id;
        if(!userId) throw new ApiError(400, "Please login to get all liked videos");

        const allLike = await Like.find({
            likedBy: userId
        });

        if(allLike.length < 1){
            return res
            .status(200)
            .json(new ApiResponse(200, allLike, "No liked videos"));
        }else{
            return res
            .status(200)
            .json(new ApiResponse(200, allLike, "Liked videos fetched succesfully"));
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

export {
    toggleVideoLike,
    toggleCommentLike,
    togglePostLike,
    getLikedVideos
};