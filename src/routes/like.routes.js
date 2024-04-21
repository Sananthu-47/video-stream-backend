import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, togglePostLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/like-video/:videoId").post(verifyJwt,toggleVideoLike);

router.route("/like-comment/:commentId").post(verifyJwt,toggleCommentLike);

router.route("/like-post/:postId").post(verifyJwt,togglePostLike);

router.route("/liked-videos").get(verifyJwt,getLikedVideos);

export default router;