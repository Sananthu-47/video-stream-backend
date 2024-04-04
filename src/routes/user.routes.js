import { Router } from "express";
import { getCurrentUser, userAvatarImageUpdate, userCoverImageUpdate, userLogin, userLogout, userRefreshAccessToken, userRegister, userUpdateProfileDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userRegister);

router.route('/login').post(userLogin);

router.route('/logout').post(verifyJwt, userLogout);

router.route('/refresh-access-token').post(userRefreshAccessToken);

router.route('/get-current-user').get(verifyJwt,getCurrentUser);

router.route("/update-profile-details").put(verifyJwt, userUpdateProfileDetails);

router.route("/update-user-avatar-image").post(verifyJwt,upload.single("avatar"),userAvatarImageUpdate);

router.route("/update-user-cover-image").post(verifyJwt,upload.single("coverImage"),userCoverImageUpdate);

export default router;