"use client";
import PostCard from "@/components/PostCard";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import { Post } from "@/types/Post";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import React from "react";
import useSWR from "swr";

const HomePage = () => {
  const { data, isLoading, error, mutate } = useSWR("/posts", fetcher);
  if (isLoading) return;
  if (error) return <div>HomePage</div>;
  return (
    <>
      <h1 className="text-4xl font-bold mb-7">Home</h1>
      <div className="max-w-xl mx-auto">
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
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
