import { getAUserData } from "@root/actions/user/otherUser";
import { AvatarAndCover, ContentBox } from "./ClientComponents";
import { SubscribeButton } from "@/components/buttons/SubscribeButton";
import { Suspense } from "react";
import moment from "moment";
import { notFound } from "next/navigation";
import Loader from "@/components/loader";

export default async function UserPage({ params, searchParams }) {
    const userDetails = await getAUserData(params?.userID);
    if (userDetails.user.length === 0) notFound();
    return (<>
        <Suspense fallback={<Loader />}>
            <AvatarAndCover userDetails={userDetails} />
            <div className="mt-12 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{userDetails?.user[0]?.name}</h1>
                    <p className="text-gray-600 text-sm">@{userDetails?.user[0]?.username} • Joined {moment(userDetails?.user[0]?.createdAt).format("MMMM YYYY")}</p>
                    <p className="text-gray-600">
                        {userDetails?.user[0]?.subscribersToUser ? userDetails?.user?.length : 0} subscribers
                    </p>
                </div>
                <SubscribeButton
                    userID={params?.userID}
                    isSubscribed={userDetails?.user[0]?.isSubscribed}
                    isAuth={userDetails?.isAuth}
                    isCurrentUser={userDetails?.isCurrentUser}
                    pathToRevalidate={`/user/${params?.userID}`}
                />
            </div>
            <ContentBox
                userDetails={userDetails}
                isAuth={userDetails?.isAuth}
                activeTab={searchParams?.tab || "videos"}
                isCurrentUser={userDetails?.isCurrentUser}
            />
        </Suspense>
    </>);
}

export async function generateMetadata({ params }) {
    const userDetails = await getAUserData(params?.userID);
    return {
        title: userDetails?.user[0]?.name || "😞 User Not Found",
        description: userDetails?.user[0]?.name + " is a user on our platform" || "Sorry, we couldn't find the user you're looking for",
    };
}