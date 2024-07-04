"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Heart, Reply } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axiosInstance from "@/lib/axios";

type CommentProps = {
  content: string;
  postID: string;
  commentID: string;
  author: {
    id: string;
    profilePicture: string;
    username: string;
    name: string;
  };
  replies: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      profilePicture: string;
    };
    likes: string[];
    createdAt: string;
  }[];
};

const CommentComponent = ({
  content,
  author,
  replies: initialReplies,
  postID,
  commentID,
}: CommentProps) => {
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(initialReplies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const replyToComment = async (content: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `/posts/${postID}/comments/${commentID}/replies`,
        { content: content }
      );
      if (response.data) {
        setReplies((prevReplies) => [...prevReplies, response.data]);
        setReplyText("");
      }
    } catch (error) {
      setError("Failed to add reply. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-7">
      <div className="mb-2 p-5 flex gap-3 items-center justify-between drop-shadow bg-secondary rounded">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage
              src={author.profilePicture}
              className="w-10 h-10"
              alt={`${author.username}'s profile`}
            />
          </Avatar>
          <div className="flex gap-1 flex-col">
            <a
              href={`/profile/${author.id}`}
              className="font-semibold text-base hover:underline"
            >
              {author.username}
            </a>
            <p className="text-sm">{content}</p>

            <Dialog>
              <DialogTrigger>
                <div className="flex items-center gap-1">
                  <Reply className="w-4 h-4" />
                  <p className="text-xs">Reply</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="mb-2">
                    Replying to comment...
                  </DialogTitle>
                  <DialogDescription className="flex flex-col gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to @${author.username}`}
                      disabled={loading}
                    />
                    {error && <p className="text-red-500 my-1">{error}</p>}
                    <Button
                      onClick={() => replyToComment(replyText)}
                      disabled={loading}
                    >
                      {loading ? "Replying..." : "Reply"}
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Heart className="w-4 cursor-pointer" />
      </div>
      <div className="ml-14">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="mb-2 p-5 flex gap-3 items-center justify-between drop-shadow bg-secondary rounded"
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-7 h-7">
                <AvatarImage
                  src={reply.author.profilePicture}
                  alt={`${reply.author.username}'s profile`}
                />
              </Avatar>
              <div>
                <p className="font-semibold text-md">{reply.author.username}</p>
                <p>{reply.content}</p>
              </div>
            </div>
            <Heart className="w-4 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentComponent;
