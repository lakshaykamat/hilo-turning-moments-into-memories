"use client";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import Head from "next/head";
import { fetcher, formatDate, formatTimestamp } from "@/lib/utils";
import { Bookmark, Heart, MessageSquare, Share } from "lucide-react";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import CommentComponent from "./CommentCard";
import { Card } from "@/components/ui/card";
import { AvatarImage, Avatar } from "@/components/ui/avatar";
import Link from "next/link";

const PostPage = ({ params }: { params: { postId: string } }) => {
  const { user } = useAuth();
  //* Fetch specific post by postId
  const { data, isLoading, error, mutate } = useSWR(
    `/posts/${params.postId}`,
    fetcher
  );
  const [postState, setPostState] = useState({
    commentText: "",
    postLike: null,
    postLikeCount: 0,
    comments: [],
  });

  useEffect(() => {
    if (data && user) {
      setPostState({
        commentText: "",
        postLike: data.likes.includes(user._id),
        postLikeCount: data.likes.length,
        comments: data.comments,
      });
    }
  }, [data, user]);

  const toggleLike = async () => {
    const likeState = !postState.postLike;
    const likeCount = likeState
      ? postState.postLikeCount + 1
      : postState.postLikeCount - 1;

    //@ts-ignore
    setPostState((prev) => ({
      ...prev,
      postLike: likeState,
      postLikeCount: likeCount,
    }));

    try {
      await axiosInstance.post(`/posts/${params.postId}/like`);
      mutate(); // Revalidate SWR cache
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert state if API call fails
      //@ts-ignore
      setPostState((prev) => ({
        ...prev,
        postLike: !likeState,
        postLikeCount: prev.postLikeCount - 1,
      }));
    }
  };

  const sharePost = async (postID: string) => {
    try {
      //* Share the post and opens the share menu of the device
      const response = await axiosInstance.post(
        `/posts/${postID}/share`,
        fetcher
      );
      if (response.data) {
        mutate();
        if (navigator.share) {
          await navigator.share({
            title: data.content,
            url: `https://synctalk.vercel.app/posts/${params.postId}`,
          });
          console.log("Shared successfully");
        } else {
          alert("Web Share API not supported");
        }
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!postState.commentText) return;
    try {
      //* Add comment to the post takes comment content
      const response = await axiosInstance.post(`/posts/${postId}/comments`, {
        content,
      });
      if (response.data) {
        mutate();
        //@ts-ignore
        setPostState((prev) => ({
          ...prev,
          commentText: "",
          comments: [...prev.comments, response.data],
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {JSON.stringify(error)}</h1>;

  if (data && user) {
    const isUserPost = data.author._id === user._id;

    return (
      <>
        <div className="w-full sm:max-w-3xl mx-auto">
          <Card className="p-4 mb-7">
            <div className="flex gap-3 items-start mb-4">
              <Link href={`/profile/${data.author._id}`}>
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={data.author.profilePicture}
                    alt={`${data.author.username}'s profile`}
                  />
                </Avatar>
              </Link>
              <div className="flex flex-col w-full">
                <h1 className="text-lg sm:text-xl font-semibold">
                  {data.author.name}
                </h1>
                <h2 className="text-sm text-muted-foreground">
                  {data.author.username}
                </h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: data.content.replace(/\n/g, "<br>"),
                  }}
                  className="mt-2 text-base"
                />
                <p className="text-muted-foreground mt-2 text-sm text-end w-full">
                  {formatDate(data.createdAt)}
                </p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between my-5">
              <div className="flex gap-2 sm:gap-5 flex-wrap">
                <ActionIcon
                  icon={
                    <Heart
                      className={
                        postState.postLike
                          ? "text-red-500 w-5 h-5 fill-red-500"
                          : ""
                      }
                    />
                  }
                  count={postState.postLikeCount}
                  onClick={toggleLike}
                />
                <ActionIcon
                  icon={<MessageSquare className="w-5 h-5" />}
                  count={postState.comments.length}
                />
                <ActionIcon
                  icon={<Share className="w-5 h-5" />}
                  count={data.shares}
                  onClick={() => sharePost(data.id)}
                />
              </div>
              <div>
                <ActionIcon
                  icon={<Bookmark className="w-5 h-5" />}
                  count={0}
                  onClick={() => {}}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                value={postState.commentText}
                onChange={(e) =>
                  setPostState((prevState) => ({
                    ...prevState,
                    commentText: e.target.value,
                  }))
                }
                className="bg-inherit dark:text-black rounded outline-1 outline px-2 outline-neutral-200 focus:bg-neutral-300 focus:outline-none text-sm w-full p-1"
                placeholder="Write your thoughts"
              />
              <Button
                onClick={() => addComment(data.id, postState.commentText)}
              >
                Comment
              </Button>
            </div>
          </Card>
          <div>
            {postState.comments.map((comment: any) => (
              <CommentComponent
                postID={data.id}
                key={comment.id}
                commentID={comment.id}
                content={comment.content}
                author={comment.author}
                replies={comment.replies}
              />
            ))}
          </div>
        </div>
      </>
    );
  }
  //TODO Create Functionality to reply to the comment
  return null;
};

type ActionIconProps = {
  icon: React.ReactNode;
  count: number;
  onClick?: () => void;
};

const ActionIcon = ({ icon, count, onClick }: ActionIconProps) => (
  <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
    {icon}
    <span>{count}</span>
    <Separator orientation="vertical" />
  </div>
);

export default PostPage;
