import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatTimestamp } from "@/lib/utils";
import Link from "next/link";

type PostProps = {
  postId: string;
  likesCount: number;
  commentsCount: number;
  content: string;
  shareCount: number;
  author: {
    profilePicture: string;
    name: string;
    username: string;
  };
  createdAt: string;
};

export const PostCard = ({
  postId,
  author,
  likesCount,
  commentsCount,
  shareCount,
  content,
  createdAt,
}: PostProps) => {
  const truncateText = (str: string, num: number) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  const text = truncateText(content, 50);
  const htmlText = text.replace(/\n/g, "<br>");

  return (
    <Link href={`/posts/${postId}`}>
      <Card className="flex flex-col justify-center gap-6 p-5">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage
              src={author.profilePicture}
              alt={`${author.name}'s profile picture`}
            ></AvatarImage>
          </Avatar>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold hover:underline">
                {author.username}
              </h3>
              <p className="text-muted-foreground text-sm">
                {formatTimestamp(createdAt)}
              </p>
            </div>
            <p
              className="break-words my-2 text-base text-balance break-word"
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
          <ActionIcon
            icon={<Share2 className="cursor-pointer" />}
            count={shareCount}
          />
        </div>
      </Card>
    </Link>
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
export default PostCard;
