"use server";

import connectDB from "./db/connectDB";
import Like from "@root/models/Like";
import { getUserData } from "./user/data";
import { revalidatePath } from "next/cache";

export async function likeHandler(currentState, data) {
    try {
        await connectDB();
        let { contentID, contentType } = data;
        let userData = await getUserData();
        if (userData.status !== 200) {
            return { status: 401, message: "Please Login to Like" };
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

export async function testAction(prevState, formData) {
    console.log(prevState, formData);
    return { status: 200, message: "Test Action" };
}