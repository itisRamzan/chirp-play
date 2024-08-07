"use server";

import Chirp from "@root/models/Chirp";
import connectDB from "./db/connectDB";
import { getUserData } from "./user/data";
import { revalidatePath } from "next/cache";
import Like from "@root/models/Like";
import mongoose from "mongoose";

export async function getChirps(userID) {
    try {
        await connectDB();
        const chirps = await Chirp.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userID)
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$owner" }
        ]);
        return { status: 200, chirps: JSON.parse(JSON.stringify(chirps[0])) };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function addChirp(currentState, formData) {
    try {
        await connectDB();
        const loggedUserData = await getUserData();
        if (loggedUserData.status !== 200) {
            return { status: 401, message: "Unauthorized" };
        }
        let currUser = loggedUserData?.user;
        if (!currUser) {
            return { status: 401, message: "Unauthorized" };
        }
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Unauthorized" };
        }
        if (currUser._id !== userData.user._id) {
            return { status: 401, message: "Unauthorized" };
        }
        await Chirp.create({
            owner: currUser._id,
            content: formData.get("chirpContent")
        });
        revalidatePath("/user/" + currUser._id + "/chirps");
        return { status: 200, message: "Chirped Successfully 😊" };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function likeChirpHandler(chirpID) {
    try {
        await connectDB();
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Please Login to Like a Chirp" };
        }
        let chirp = await Chirp.findById(chirpID).populate("owner").select("-password");
        if (!chirp) {
            return { status: 404, message: "Chirp not found" };
        }
        let exisLike = await Like.findOne({ contentID: chirpID, onModel: "Chirp", likedBy: userData.user._id });
        if (exisLike) {
            await Like.findByIdAndDelete(exisLike._id);
            revalidatePath("/user/" + chirp.owner._id + "?tab=chirps");
            return { status: 200, message: "Chirp was UnLiked 😢" };
        }
        await Like.create({
            contentID: chirpID,
            onModel: "Chirp",
            likedBy: userData.user._id
        });
        revalidatePath("/user/" + chirp.owner._id + "?tab=chirps");
        return { status: 200, message: "Chirp was Liked 😊" };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function deleteChirp(chirpID) {
    try {
        await connectDB();
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Please Login to delete a Chirp" };
        }
        let chirp = await Chirp.findById(chirpID).populate("owner").select("-password");
        if (!chirp) {
            return { status: 404, message: "Chirp not found" };
        }
        if (chirp.owner._id.toString() !== userData.user._id) {
            return { status: 401, message: "Unauthorized" };
        }
        await Chirp.findByIdAndDelete(chirpID);
        await Like.deleteMany({ contentID: chirpID, onModel: "Chirp" });
        revalidatePath("/user/" + userData.user._id + "?tab=chirps");
        return { status: 200, message: "Chirp Deleted Successfully" };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function editChirp(currentState, fomrData) {
    try {
        await connectDB();
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Please Login to edit a Chirp" };
        }
        let chirp = await Chirp.findById(fomrData.get("chirpID")).populate("owner").select("-password");
        if (!chirp) {
            return { status: 404, message: "Chirp not found" };
        }
        if (chirp.owner._id.toString() !== userData.user._id) {
            return { status: 401, message: "Unauthorized" };
        }
        await Chirp.findByIdAndUpdate(fomrData.get("chirpID"), { content: fomrData.get("chirpContent") });
        revalidatePath("/user/" + userData.user._id + "?tab=chirps");
        return { status: 200, message: "Chirp Edited Successfully" };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}