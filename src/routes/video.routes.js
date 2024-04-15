import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, publishVideo, togglePublishStatus, updateVideo, updateVideoThumbnail } from "../controllers/video.controller.js";
const router = Router();

router.route('/publish-video').post(verifyJwt,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo);

router.route('/get-video-by-id/:videoId').get(getVideoById);

router.route('/update-video-status/:videoId/:status').patch(verifyJwt,togglePublishStatus);

router.route('/update-video-details/:videoId').patch(verifyJwt,updateVideo);

router.route("/update-video-thumbnail/:videoId").patch(verifyJwt,upload.single("thumbnail"),updateVideoThumbnail);

router.route('/delete-video/:videoId').delete(verifyJwt,deleteVideo);


export default router;