import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllRepliesToComment, getAllVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/add-comment/:videoId").post(verifyJwt, addComment);

router.route("/update-comment/:commentId").put(verifyJwt, updateComment);

router.route("/delete-comment/:commentId").delete(verifyJwt, deleteComment);

router.route("/get-all-comments/:videoId").get(getAllVideoComments);

router.route("/get-all-replies/:videoId/:parentCommentId").get(getAllRepliesToComment);


export default router;