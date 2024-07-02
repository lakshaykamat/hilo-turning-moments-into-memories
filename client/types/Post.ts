export type Post = {
  id: string;
  content: string;
  author: {
    profilePicture: string;
    name: string;
    username: string;
  };
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};
export type Comment = {
  id: string;
  content: string;
  author: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
};
export type Reply = {
  content: string;
  author: string;
  _id: string;
  likes: string[];
  createdAt: string;
};
