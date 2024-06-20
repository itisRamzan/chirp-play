"use server";

import connectDB from "./db/connectDB";
import Like from "@root/models/Like";
import { getUserData } from "./user/data";
import { revalidatePath } from "next/cache";

export async function likeHandler(contentID, contentType) {
    try {
        await connectDB();
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Please login to Like" };
        }
        let like = await Like.findOne({
            contentID: contentID,
            likedBy: userData.user._id,
            onModel: contentType,
        });
        if (like) {
            await Like.deleteOne({
                contentID: contentID,
                likedBy: userData.user._id,
                onModel: contentType,
            });
            revalidatePath("/dashboard");
            revalidatePath(`/${contentType.toString().toLowerCase()}/${contentID}`);
            return { status: 200, message: "Unliked successfully 😞" };
        }
        await Like.create({
            contentID: contentID,
            likedBy: userData.user._id,
            onModel: contentType,
        });
        revalidatePath("/dashboard");
        revalidatePath(`/${contentType.toString().toLowerCase()}/${contentID}`);
        return { status: 200, message: "Liked successfully 🙂" };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function likeStatus(contentID) {
    try {
        await connectDB();
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Unauthorized" };
        }
        let like = await Like.findOne({
            contentID: contentID,
            likedBy: userData.user._id,
        });
        return { status: 200, isLiked: like ? true : false };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}

export async function getLikes(contentID) {
    try {
        await connectDB();
        let totalLikes = await Like.countDocuments({ contentID: contentID });
        return { status: 200, totalLikes: totalLikes };
    }
    catch (error) {
        return { status: 500, message: "Internal Server Error " + error.message };
    }
}