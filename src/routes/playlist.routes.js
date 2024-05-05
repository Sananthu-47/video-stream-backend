import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create-playlist").post(verifyJwt,createPlaylist);

export default router;