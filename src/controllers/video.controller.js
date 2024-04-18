import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteBeforeUpload, uploadFileToBucket } from "../utils/s3FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose, { Mongoose, Schema } from "mongoose";

const publishVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body;

    if(!title) throw new ApiError(400, "Title of the video is required");

    let videoPath;
    let thumbnailPath;

    if (
        req.files &&
        Array.isArray(req.files.videoFile) &&
        req.files.videoFile.length > 0
    )
        videoPath = req.files.videoFile[0].path;

    if (!videoPath) throw new ApiError(400, "Video file is required");

    if (
        req.files &&
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail.length > 0
    )
        thumbnailPath = req.files.thumbnail[0].path;
    
    if(!thumbnailPath) throw new ApiError(400, "Thumbnail is required");

    const videoFile = await uploadFileToBucket(videoPath, "videos");
    if (!videoFile) throw new ApiError(400, "Video file is required");

    const thumbnail = await uploadFileToBucket(thumbnailPath, "thumbnails");
    if (!thumbnail) throw new ApiError(400, "Thumbnail is required");

    const video = await Video.create({
        title,
        description,
        videoFileUrl: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user._id
    });

    if (!video)
        throw new ApiError(500, "Something went wrong while uploding video");

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                video,
                "Video uploaded successfully",
            ),
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400,"Video id is missing");
        try{
            const video = await Video.findById(videoId);
            if(!video) throw new ApiError(404,"Video not found");
            return res
            .status(200)
            .json(
                new ApiResponse(200,video,"Video found successfully")
            );
        }
        catch(err){
            throw new ApiError(400, "Error: " + err.reason);
        }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId, status } = req.params;
    if(!videoId) throw new ApiError(404, "Video id is missing");
    if(!status) throw new ApiError(400, "Status is missing");

    try{
        const video = await Video.findByIdAndUpdate(videoId,{
            $set: {
                isPublished: status
            }
        },
        {
            new: true
        });

        if(!video) throw new ApiError(400, "Video status couldn't be updated");
        return res
        .status(200)
        .json(
            new ApiResponse(200,video,"Video status changed successfully")
        )
    }catch(err){
        throw new ApiError(400, "Error: "+err);
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description} = req.body;

    if(!videoId) throw new ApiError(400, "Video id is missing");

    if(!title) throw new ApiError(400, "Title is mandatory to be filled");

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        { new: true },
    );

    if(!video) throw new ApiError(400, "Error while updating video details");

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const updateVideoThumbnail = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is not found");

    const videoThumbnailOld = await Video.findById(videoId).select('thumbnail');
    if(!videoThumbnailOld) throw new ApiError(400, "Video details is not fetched");

    if (!req.file || !req.file?.path) throw new ApiError(400, "Thumbnail is required");
    const thumbnailPath = req.file.path;

    const thumbnail = await uploadFileToBucket(thumbnailPath,"thumbnails");
    if(!thumbnail) throw new ApiError(400, "Error while updating the thumbnail");

    const deleted = await deleteBeforeUpload(videoThumbnailOld.thumbnail,"thumbnails");
    if(!deleted) throw new ApiError(400, "Error while deleting old thumbnail"); 

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {thumbnail : thumbnail?.url}
        },
        {new: true}
    );

    return res.status(200)
    .json(new ApiResponse(200,video,"Thumbnail updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!videoId) throw new ApiError(400, "Video Id is missing");

    const video = await Video.findByIdAndDelete(videoId);
    if(!video) throw new ApiError(400, "Video id is not found or not able to delete");

    const thumbnailDeleted = await deleteBeforeUpload(video.thumbnail,"thumbnails");
    if(!thumbnailDeleted) throw new ApiError(400, "Error while deleting thumbnail"); 

    const videoDeleted = await deleteBeforeUpload(video.videoFileUrl,"videos");
    if(!videoDeleted) throw new ApiError(400, "Error while deleting video"); 

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));

});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 0, limit = 10, query, sortBy = "createdAt", sortType = 1, userId } = req.query;

    if(!userId) throw new ApiError(400, "Channel id is required");

    const channelId = new mongoose.Types.ObjectId(userId);

    const videos = await Video.aggregate([
        [
            // Lookup will join the users table and check for the userid
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user_info"
              }
            },
            // Match will filter based on userid & if it is published
            {
              $match: {
                $and: [
                    {"user_info._id": channelId},
                    {"isPublished": true}
                ]
              }
            },
            // Project will act as the return type of ouput, what all to return in response
            {
              $project: {
                thumbnail: 1,
                title: 1,
                duration: 1,
                views: 1,
                username: { "$arrayElemAt": ["$user_info.username", 0] },
                user_avatar: { "$arrayElemAt": ["$user_info.avatar", 0] },
                createdAt: 1
              }
            },
            // Sort based on the parameter for example: createdAt: 1 means, order videos in ascending order oldest to newest
            {
                $sort: {
                    [sortBy] : Number(sortType)
                }
            },
            // Skip act as the start point of pagination, for example page is 1 then limit is say 10, then 1 * 10 it will start from 10th video
            {
              $skip: page * limit
            },
            // Limit fetchs so many documents from the start point
            {
              $limit: limit
            }
          ]
    ]);

    if(!videos) throw new ApiError(400, "No videos found");

    return res
    .status(200)
    .json(new ApiResponse(200,videos,"Videos fetched successfully"));
});

export {
    publishVideo,
    getVideoById,
    togglePublishStatus,
    updateVideo,
    updateVideoThumbnail,
    deleteVideo,
    getAllVideos
};


