import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const { comment, parentCommentId = null, mentions } = req.body;
        if (!videoId) throw new ApiError(400, "Video id is missing");
        if (!comment) throw new ApiError(400, "Content is required");

        const owner = req.user?._id;

        if (!owner) throw new ApiError(400, "Please login to comment");

        const comments = await Comment.create({
            videoId,
            comment,
            owner,
            parentCommentId,
            mentions,
        });

        if (!comments) throw new ApiError(400, "Error while adding a comment");

        return res
            .status(200)
            .json(new ApiResponse(200, comments, "Comment added successfully"));
    } catch (error) {
        console.log(error);
        next(error);
    }
});

const updateComment = asyncHandler(async (req, res, next) => {
    try {
        const { comment, mentions } = req.body;
        const { commentId } = req.params;
        const owner = req.user?._id;

        if (!commentId) throw new ApiError(400, "Video id is missing");
        if (!comment) throw new ApiError(400, "Content cannot be empty");
        if (!owner) throw new ApiError(400, "Please login to edit the comment");

        const comments = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    comment,
                    mentions,
                },
            },
            { new: true },
        );

        if (!comments)
            throw new ApiError(400, "Error while updating the comment");

        return res
            .status(200)
            .json(
                new ApiResponse(200, comments, "Comment updated succesfully"),
            );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

const deleteComment = asyncHandler(async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const owner = req.user?._id;

        if (!commentId) throw new ApiError(400, "Video id is missing");
        if (!owner) throw new ApiError(400, "Please login to edit the comment");

        const comment = await Comment.findByIdAndDelete(commentId);

        if (!comment)
            throw new ApiError(400, "Error while deleting the comment");

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "COmment deleted successfully"),
            );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

const getAllVideoComments = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const { page = 0, limit = 10 } = req.query;

        if (!videoId) throw new ApiError(400, "Video id is missing");
        const videoIdObject = new mongoose.Types.ObjectId(videoId);

        const comments = await Comment.aggregate([
            {
                $match: {
                    videoId: videoIdObject,
                    parentCommentId: null,
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "parentCommentId",
                    as: "replies",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "commentId",
                    as: "commentLikes"
                }
            },
            {
                $project: {
                    comment: 1,
                    videoId: 1,
                    repliesCount: { $size: "$replies" },
                    commentLikesCount: { $size: "$commentLikes" },
                    username: { $arrayElemAt: ["$user.username", 0] },
                    avatar: { $arrayElemAt: ["$user.avatar", 0] },
                },
            },
            {
                $skip: page * limit,
            },
            {
                $limit: limit,
            },
        ]);

        if (comments.length == 0) throw new ApiError(400, "No comments");

        return res
            .status(200)
            .json(
                new ApiResponse(200, comments, "Comments fetched successfully"),
            );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

const getAllRepliesToComment = asyncHandler(async (req, res, next) => {
    try {
        const {videoId, parentCommentId} = req.params;
        const { page = 0, limit = 10 } = req.query;
        if(!videoId) throw new ApiError(400, "Video id is missing");
        if(!parentCommentId) throw new ApiError(400, "ParentCommentId is missing");

        const videoIdObject = new mongoose.Types.ObjectId(videoId);
        const parentCommentIdObject = new mongoose.Types.ObjectId(parentCommentId);

        const comments = await Comment.aggregate([
            {
                $match: {
                    videoId: videoIdObject,
                    parentCommentId: parentCommentIdObject
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "user",
                }
            },
            {
                $project: {
                    comment: 1,
                    username: {
                      $arrayElemAt: ["$user.username", 0],
                    },
                    avatar: {
                      $arrayElemAt: ["$user.avatar", 0],
                    },
                }
            },
            {
                $skip: page * limit,
            },
            {
                $limit: Number(limit),
            },
        ])

        if(comments.length == 0) return res.status(200).json(new ApiResponse(200, "No replies to comment"));

        return res
        .status(200)
        .json(new ApiResponse(200, comments, "Replies fetched successfully"));

    } catch (error) {
        console.log(error);
        next(error)
    }
});

export { addComment, updateComment, deleteComment, getAllVideoComments, getAllRepliesToComment };
