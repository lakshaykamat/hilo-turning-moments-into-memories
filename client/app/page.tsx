"use client";
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
        {data.map((post: Post) => (
          <PostCard
            postId={post.id}
            author={post.author}
            likesCount={post.likes?.length || 0}
            commentsCount={post.comments?.length || 0}
            content={post.content}
          />
        ))}
      </div>
    </>
  );
};

type PostProps = {
  postId: string;
  likesCount: number;
  commentsCount: number;
  content: string;
  author: {
    profilePicture: string;
    name: string;
    username: string;
  };
};

export const PostCard = ({
  postId,
  author,
  likesCount,
  commentsCount,
  content,
}: PostProps) => {
  const truncateText = (str: string, num: number) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  const text = truncateText(content, 50);
  const htmlText = text.replace(/\n/g, "<br>");

  return (
    <a href={`/posts/${postId}`}>
      <Card className="flex flex-col justify-center gap-6 p-5">
        <div className="flex items-start gap-3">
          <img
            className="w-10 rounded-full"
            src={author.profilePicture}
            alt=""
          />
          <div>
            <h3 className="text-lg font-semibold hover:underline">
              {author.username}
            </h3>
            <p
              className="break-words text-balance break-word"
              style={{ wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: htmlText }}
            />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <ActionIcon icon={<Heart />} count={likesCount} />
            <ActionIcon icon={<MessageSquare />} count={commentsCount} />
          </div>
          <Share2 className="cursor-pointer" />
        </div>
      </Card>
    </a>
  );
};
type ActionIconProps = {
  icon: React.ReactNode;
  count: number;
};

const ActionIcon = ({ icon, count }: ActionIconProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <span>{count}</span>
  </div>
);

export default HomePage;
