import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: "https://res.cloudinary.com/cloudformedia/image/upload/v1719156912/chirp-play/demo-thumbnail-for-videos.png"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number
    },
    views: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
});

export default mongoose.models.Video || mongoose.model("Video", VideoSchema);