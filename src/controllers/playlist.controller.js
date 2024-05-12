import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req,res,next)=>{
    try {
        const {name, description, status, videos} = req.body;
        const owner = req.user?._id;
        if(!name) throw new ApiError(400, "Name of the playlist is required");
        if(!owner) throw new ApiError(400, "Please login to create playlist");
        
        const playlist = await Playlist.create({
            name,
            description,
            status,
            owner,
            videos
        });

        if(!playlist) throw new ApiError(400, "Something went wrong while creating the playlist ");

        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"))

    } catch (error) {
        console.log(error);
        next(error);
    }
});

const getUserPlaylists = asyncHandler(async (req, res, next) => {
    try {
        const {userId} = req.params
        if(!userId) throw new ApiError(400, "User Id is missing");
    
        const playlist = await Playlist.find({
            owner: userId
        });
    
        if(playlist.length == 0){
            return res
            .status(200)
            .json(new ApiResponse(200, playlist, "No playlist found"));
        }else{
            return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist found"));
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

const getPlaylistById = asyncHandler(async (req, res, next) => {
    try {
        const {playlistId} = req.params
        if(!playlistId) throw new ApiError(400, "Playlist Id is missing");

        const userId = req.user?._id;
        const playlist = await Playlist.find({
            _id: playlistId
        });
    
        if(playlist.length == 0){
            return res
            .status(200)
            .json(new ApiResponse(200, playlist, "No playlist found"));
        }else{
            return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist found"));
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
    try {
        const {playlistId} = req.params;
        const {videos} = req.body;
        if(!playlistId) throw new ApiError(400, "Playlist Id is missing");
        if(videos.length == 0) throw new ApiError(400, "Videos are missing");
        if(!req?.user?._id) throw new ApiError(400, "Please login to add video to playlist");
    
        const playlist = await Playlist.findOneAndUpdate({
            _id: playlistId
        },{
            $addToSet : {
                videos
            }
        },{
            returnOriginal: false
        });
    
        if(!playlist) throw new ApiError(400, "Error while updating the playlist");

        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
    } catch (error) {
        console.log(error);
        next(error);
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
    try {
        const {playlistId, videoId} = req.params;
        if(!playlistId) throw new ApiError(400, "Playlist Id is missing");
        if(!videoId) throw new ApiError(400, "Video Id is missing");

        if(!req?.user?._id) throw new ApiError(400, "Please login to delete video from playlist");
    
        const playlist = await Playlist.updateOne(
            { _id: playlistId },
            { $pull: { videos : videoId } }
        );
    
        if(!playlist) throw new ApiError(400, "Error while deleting video from the playlist");

        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video deleted from playlist"));
    } catch (error) {
        console.log(error);
        next(error);
    }
})

const deletePlaylist = asyncHandler(async (req, res, next) => {
    try {
        const {playlistId} = req.params;
        if(!playlistId) throw new ApiError(400, "Playlist Id is missing");
        if(!req.user?._id) throw new ApiError(400, "Please login to delete the playlist");
    
        const playlist = await Playlist.findByIdAndDelete({
            _id: playlistId
        });
    
        if(!playlist) throw new ApiError(400, "Error while deleting the playlist");
        return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted succesfully"));
        
    } catch (error) {
        console.log(error);
        next(error);
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    deletePlaylist,
    removeVideoFromPlaylist
};