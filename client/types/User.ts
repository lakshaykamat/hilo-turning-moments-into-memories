export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  friends: Array<Object>;
  profilePicture: string;
  token: string;
  createdAt: string;
};
