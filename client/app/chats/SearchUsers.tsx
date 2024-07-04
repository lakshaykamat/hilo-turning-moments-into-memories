import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

type User = {
  _id: string;
  username: string;
  profilePicture: string;
};

type Props = {
  setSelectedChat: React.Dispatch<
    React.SetStateAction<{
      profilePicture: string;
      name: string;
      message: string;
      _id: string;
      senderID: string;
      type: "private" | "group";
    } | null>
  >;
};

const SearchUsers = ({ setSelectedChat }: Props) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (username: string) => {
    if (!username.trim()) {
      setUsers([]);
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/users/search?username=${username}`
      );
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error searching users:", error);
      setError(error.response.data.message);
    }
  };

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.find((user) => user._id === selectedUser._id)
        ? prevSelectedUsers.filter((user) => user._id !== selectedUser._id)
        : [...prevSelectedUsers, selectedUser]
    );
  };

  const createChatRoom = async () => {
    if (selectedUsers.length === 1 && user) {
      // Create a private chat
      try {
        const response = await axiosInstance.post("/chatrooms", {
          name: "Private Chat",
          type: "private",
          users: [{ _id: selectedUsers[0]._id }],
        });

        const response2 = await axiosInstance.get(
          `/users/${selectedUsers[0]._id}`
        );
        if (response2.data && response.data) {
          setSelectedChat({
            profilePicture: response2.data.profilePicture,
            name: response2.data.username,
            message: " ",
            _id: response.data.id,
            senderID: user._id,
            type: "private",
          });
        }
      } catch (error: any) {
        console.error("Error creating private chat room:", error);
        setError(error.response.data.message);
      }
    } else if (selectedUsers.length > 1 && user) {
      // Create a group chat
      try {
        const response = await axiosInstance.post("/chatrooms", {
          name: "Group Chat",
          type: "group",
          users: selectedUsers.map((user) => ({ _id: user._id })),
        });

        if (response.data) {
          setSelectedChat({
            profilePicture:
              response.data.groupImage ||
              "https://i.pinimg.com/564x/e7/22/3b/e7223b49e4a8d006798f795c236ca54f.jpg",
            name: "Group Chat",
            message: " ",
            _id: response.data.id,
            senderID: user._id,
            type: "group",
          });
        }
      } catch (error) {
        console.error("Error creating group chat room:", error);
        setError("Failed to create group chat. Please try again.");
      }
    }
  };

  return (
    <div>
      <Input
        onChange={(e) => {
          setInputText(e.target.value);
          searchUsers(e.target.value);
        }}
        value={inputText}
        placeholder="Search by username"
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div>
        {users.length > 0 ? (
          users.map((user) => (
            <Card
              key={user._id}
              onClick={() => toggleUserSelection(user)}
              className={`flex my-4 p-2 items-center gap-2 cursor-pointer hover:bg-secondary ${
                selectedUsers.find((u) => u._id === user._id)
                  ? "bg-gray-200"
                  : ""
              }`}
            >
              <Avatar>
                <AvatarImage
                  src={user.profilePicture}
                  alt={`${user.username}'s profile picture`}
                />
              </Avatar>
              <h4 className="font-semibold">{user.username}</h4>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">No users found</p>
        )}
      </div>
      {selectedUsers.length > 0 && (
        <Button onClick={createChatRoom} className="mt-4">
          {selectedUsers.length === 1
            ? "Create Private Chat"
            : "Create Group Chat"}
        </Button>
      )}
    </div>
  );
};

export default SearchUsers;
