"use client";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import { Post } from "@/types/Post";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import React from "react";
import useSWR from "swr";

const ProfilePageOfUser = ({ params }: { params: { userId: string } }) => {
  const { data, isLoading, error } = useSWR(`/users/${params.userId}`, fetcher);

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...</h1>;
  if (data) {
    return (
      <>
        <h1 className="text-4xl font-bold mb-7">Profile</h1>
        <div className="flex flex-col items-center gap-6 md:items-start">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
            <img
              className="w-32 mx-auto rounded-full"
              src={data.profilePicture}
              alt={data.username}
            />
            <div className="flex flex-col items-center gap-2 md:items-start">
              <h1 className="text-3xl font-bold">{data.name}</h1>
              <span>{data.username}</span>
            </div>
          </div>
          <div className="w-full">
            <h4 className="mb-4 text-2xl font-semibold">Posts</h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* <div className="flex flex-wrap items-start gap-6"> */}
              {data.posts.map((post: Post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  content={post.content}
                  commentsCount={post.comments.length}
                  likesCount={post.likes.length}
                  profilePicture={data.profilePicture}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
};

type Postprops = {
  postId: string;
  profilePicture: string;
  likesCount: number;
  commentsCount: number;
  content: string;
};
const PostCard = (props: Postprops) => {
  const truncateText = (str: string, num: number) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };
  const text = truncateText(props.content, 25);
  const htmlText = text.replace(/\n/g, "<br>");
  return (
    <a href={`/posts/${props.postId}`}>
      <Card className="flex flex-col justify-center gap-6 p-5">
        <div className="flex items-start gap-3">
          <img
            className="w-10 rounded-full"
            src={props.profilePicture}
            alt=""
          />
          <div>
            <h3 className="text-lg font-semibold">Lakshay</h3>
            <p
              className="break-words text-balance break-word"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: htmlText }}
            />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Heart />
              <span>{props.likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare />
              <span>{props.commentsCount}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Share2 />
          </div>
        </div>
      </Card>
    </a>
  );
};

export default ProfilePageOfUser;
