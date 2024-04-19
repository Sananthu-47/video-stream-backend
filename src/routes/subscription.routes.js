import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route('/subscribe/:channelId').post(verifyJwt,toggleSubscription);

router.route('/get-subscribers').get(verifyJwt,getUserChannelSubscribers);

router.route('/get-subscribed-channels').get(verifyJwt,getSubscribedChannels);

export default router;