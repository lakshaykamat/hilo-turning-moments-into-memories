import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { fetcher } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  MessageSquare,
  Share,
  Share2,
} from "lucide-react";
import React from "react";
import useSWR from "swr";

const User_POSTS = [
  {
    content: "Team India will wiinnn!!!",
    likes: 230,
  },
  {
    content: "Women 🍵",
    likes: 30,
  },
  {
    content: "Sigma hu bhai ase mat bol",
    likes: 30,
  },
];
const ProfilePage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR("/posts", fetcher);
  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...</h1>;
  return (
    <>
      <h1 className="text-4xl font-bold mb-7">Profile</h1>
      <div className="flex flex-col items-center gap-6 md:items-start">
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          <img
            className="w-32 mx-auto rounded-full"
            src={user.profilePicture}
            alt={user.username}
          />
          <div className="flex flex-col items-center gap-2 md:items-start">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <span>{user.username}</span>
          </div>
        </div>
        <div className="w-full">
          <h4 className="mb-4 text-2xl font-semibold">Posts</h4>
          <div className="grid flex-col grid-cols-1 gap-6 md:grid-cols-3">
            {/* <div className="flex flex-wrap items-start gap-6"> */}
            {data.map((post) => (
              <Post
                key={post.id}
                postId={post.id}
                content={post.content}
                commentsCount={post.comments.length}
                likesCount={post.likes.length}
                profilePicture={user.profilePicture}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const Post = (props) => {
  const truncateText = (str, num) => {
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
export default ProfilePage;
