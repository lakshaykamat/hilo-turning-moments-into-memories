"use client";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import React from "react";
import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { Post } from "@/types/Post";
import { PostCard } from "../page";

const ProfilePage = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useSWR(`/users/${user?._id}`, fetcher); // Fetches users posts

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...{JSON.stringify(error)}</h1>;

  if (data && user) {
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
              {data.posts.length > 0 ? (
                data.posts.map((post: Post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
                    author={post.author}
                    likesCount={post.likes?.length || 0}
                    commentsCount={post.comments?.length || 0}
                    content={post.content}
                  />
                ))
              ) : (
                <p>No posts available</p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default ProfilePage;
