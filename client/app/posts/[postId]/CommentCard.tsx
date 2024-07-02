import { Heart } from "lucide-react";

type CommentProps = {
  content: string;
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

const CommentComponent = ({ content, author, replies }: CommentProps) => (
  <div className="mb-7">
    <div className="mb-2 p-5 flex gap-3 items-center justify-between drop-shadow bg-secondary rounded">
      <div className="flex items-start gap-3">
        <img
          src={author.profilePicture}
          className="w-7 h-7 rounded-full"
          alt=""
        />
        <div>
          <a
            href={`/profile/${author.id}`}
            className="font-semibold text-md hover:underline"
          >
            {author.username}
          </a>
          <p>{content}</p>
        </div>
      </div>
      <Heart className="w-4" />
    </div>
    <div className="ml-14">
      {replies.map((reply, i) => (
        <div
          key={i}
          className="mb-2 p-5 flex gap-3 items-center justify-between drop-shadow bg-secondary rounded"
        >
          <div className="flex items-start gap-3">
            <img
              src={reply.author.profilePicture}
              className="w-7 h-7 rounded-full"
              alt=""
            />
            <div>
              <p className="font-semibold text-md">{reply.author.username}</p>
              <p>{reply.content}</p>
            </div>
          </div>
          <Heart className="w-4" />
        </div>
      ))}
    </div>
  </div>
);
export default CommentComponent;
