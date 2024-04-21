import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

export const Like = mongoose.model("Like", likeSchema);