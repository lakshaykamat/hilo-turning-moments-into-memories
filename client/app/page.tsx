"use client";
import PostCard from "@/components/PostCard";
import { fetcher } from "@/lib/utils";
import { Post } from "@/types/Post";
import React from "react";
import useSWR from "swr";

const HomePage = () => {
  const { data, isLoading, error } = useSWR("/posts", fetcher); //* Fetches all post
  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <div>HomePage</div>;
  return (
    <>
      <h1 className="text-2xl sm:text-4xl font-bold mb-7">Home</h1>
      <div className="max-w-xl mx-auto mb-20">
        <div className="flex flex-col gap-6">
          {data.map((post: Post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              shareCount={post.shares}
              author={post.author}
              likesCount={post.likes?.length || 0}
              commentsCount={post.comments?.length || 0}
              content={post.content}
              createdAt={post.createdAt}
            />
          ))}
        </div>
      </div>
    </>
  );
};
//TODO Create Skeletons
export default HomePage;
