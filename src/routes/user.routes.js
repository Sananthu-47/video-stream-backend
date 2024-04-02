import { Router } from "express";
import { getCurrentUser, userLogin, userLogout, userRefreshAccessToken, userRegister } from "../controllers/user.controller.js";
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
export default router;