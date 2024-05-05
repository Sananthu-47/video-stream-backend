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

export {
    createPlaylist,
};