"use client";
import PostCard from "@/components/PostCard";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import { Post } from "@/types/Post";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import React from "react";
import useSWR from "swr";

const ProfilePageOfUser = ({ params }: { params: { userId: string } }) => {
  const { data, isLoading, error } = useSWR(`/users/${params.userId}`, fetcher); //Fetch user details by userID

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...</h1>;
  if (data) {
    console.log(data);
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
              {data.posts.map((post: Post) => {
                const author = {
                  name: data.name,
                  profilePicture: data.profilePicture,
                  username: data.username,
                };
                return (
                  <PostCard
                    key={post.id}
                    shareCount={post.shares}
                    postId={post.id}
                    content={post.content}
                    commentsCount={post.comments.length}
                    likesCount={post.likes.length}
                    author={author}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default ProfilePageOfUser;
