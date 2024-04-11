import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileToBucket } from "../utils/s3FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Video } from "../models/video.model.js";

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
})

export {
    publishVideo
};


