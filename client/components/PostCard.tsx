import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Card } from "./ui/card";

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
};

export const PostCard = ({
  postId,
  author,
  likesCount,
  commentsCount,
  shareCount,
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
              className="break-words text-base text-balance break-word"
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
export default PostCard;
