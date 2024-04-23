import {Comment} from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async(req,res,next)=>{
    try {
        const {videoId} = req.params;
        const {content, parentCommentId=null, mentions} = req.body;
        if(!videoId) throw new ApiError(400, "Video id is missing");
        if(!content) throw new ApiError(400, "Content is required");
    
        const owner = req.user?._id;
    
        if(!owner) throw new ApiError(400, "Please login to comment");
    
        const comment = await Comment.create({
            videoId,
            content,
            owner,
            parentCommentId,
            mentions
        });
    
        if(!comment) throw new ApiError(400, "Error while adding a comment");
    
        return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"));
    } catch (error) {
        console.log(error);
        next(error);
    }

});

const updateComment = asyncHandler(async (req, res, next) => {
    try {
        const {content, mentions} = req.body;
        const {commentId} = req.params;
        const owner = req.user?._id;

        if(!commentId) throw new ApiError(400, "Video id is missing");
        if(!content) throw new ApiError(400, "Content cannot be empty");
        if(!owner) throw new ApiError(400, "Please login to edit the comment");

        const comment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content,
                    mentions,
                },
            },
            { new: true },
        );

        if(!comment) throw new ApiError(400, "Error while updating the comment");

        return res
        .status(200)
        .json(new ApiResponse(200,comment,"Comment updated succesfully"));

    } catch (error) {
        console.log(error);
        next(error)
    }
})

const deleteComment = asyncHandler(async (req, res, next) => {
    try {
        const {commentId} = req.params;
        const owner = req.user?._id;

        if(!commentId) throw new ApiError(400, "Video id is missing");
        if(!owner) throw new ApiError(400, "Please login to edit the comment");

        const comment = await Comment.findByIdAndDelete(commentId);

        if(!comment) throw new ApiError(400, "Error while deleting the comment");

        return res
        .status(200)
        .json(new ApiResponse(200,comment,"COmment deleted successfully"));
    } catch (error) {
        console.log(error);
        next(error)
    }
})

export {
    addComment,
    updateComment,
    deleteComment
}