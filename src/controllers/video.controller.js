import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteBeforeUpload, uploadFileToBucket } from "../utils/s3FileUploader.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
})

export {
    publishVideo,
    getVideoById,
    togglePublishStatus,
    updateVideo,
    updateVideoThumbnail
};


