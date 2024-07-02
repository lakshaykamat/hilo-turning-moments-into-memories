"use client";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/lib/axios";
import { NextSeo } from "next-seo";
import { fetcher } from "@/lib/utils";
import { Bookmark, Heart, MessageSquare, Share } from "lucide-react";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import CommentComponent from "./CommentCard";
import { Card } from "@/components/ui/card";

const PostPage = ({ params }: { params: { postId: string } }) => {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR(
    `/posts/${params.postId}`,
    fetcher
  );
  const [postState, setPostState] = useState({
    commentText: "",
    comments: [],
  });

  useEffect(() => {
    if (data && user) {
      setPostState({
        commentText: "",
        comments: data.comments,
      });
    }
  }, [data, user]);

  const toggleLike = async () => {
    try {
      const response = await axiosInstance.post(`/posts/${params.postId}/like`);
      if (response.data) {
        mutate();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const sharePost = async (postID: string) => {
    try {
      // http://localhost:5000/api/v1/posts/:postId/share
      const response = await axiosInstance.post(
        `/posts/${postID}/share`,
        fetcher
      );
      if (response.data) {
        mutate();
        if (navigator.share) {
          await navigator.share({
            title: data.content,
            url: `http://localhost:3000/posts/${params.postId}`,
          });
          console.log("Shared successfully");
        } else {
          console.log("Web Share API not supported");
        }
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!postState.commentText) return;
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, {
        content,
      });
      if (response.data) {
        mutate();
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
        <NextSeo
          title={`My Blog`}
          // description={data.excerpt}
          // openGraph={{
          //   type: 'article',
          //   url: `http://localhost:3000/posts/${params.postId}`,
          //   title: data.title,
          //   description: data.excerpt,
          //   images: [
          //     {
          //       url: data.image,
          //       width: 800,
          //       height: 600,
          //       alt: `${data.title} image`,
          //     },
          //   ],
          // }}
          // twitter={{
          //   handle: '@handle',
          //   site: '@site',
          //   cardType: 'summary_large_image',
          // }}
        />
        <div className="max-w-xl mx-auto p-4">
          <Card className="p-5 mb-7">
            <div className="flex gap-3 items-start mb-4">
              <a href={`/profile/${data.author._id}`}>
                <img
                  className="w-14 h-14 rounded-full"
                  src={data.author.profilePicture}
                  alt={`${data.author.username}'s profile`}
                />
              </a>
              <div className="flex flex-col">
                <h1 className="text-xl font-semibold">{data.author.name}</h1>
                <h2 className="text-sm text-muted-foreground">
                  {data.author.username}
                </h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: data.content.replace(/\n/g, "<br>"),
                  }}
                  className="mt-2 text-base"
                />
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between my-5">
              <div className="flex gap-6">
                <ActionIcon
                  icon={
                    <Heart
                      className={
                        data.likes.includes(user._id)
                          ? "text-red-500 fill-red-500"
                          : ""
                      }
                    />
                  }
                  count={data.likes.length}
                  onClick={toggleLike}
                />
                <ActionIcon
                  icon={<MessageSquare />}
                  count={postState.comments.length}
                />
                <ActionIcon
                  icon={<Share />}
                  count={data.shares}
                  onClick={() => sharePost(data.id)}
                />
              </div>
              <Bookmark className="cursor-pointer" />
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
                key={comment._id}
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
