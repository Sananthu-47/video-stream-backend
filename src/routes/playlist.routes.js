import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create-playlist").post(verifyJwt,createPlaylist);

router.route("/get-playlists/:userId").get(getUserPlaylists);

router.route("/get-playlist/:playlistId").get(getPlaylistById);

router.route("/add-video-to-playlist/:playlistId").put(verifyJwt,addVideoToPlaylist);

router.route("/delete-playlist/:playlistId").delete(verifyJwt,deletePlaylist);

export default router;