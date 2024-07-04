"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import useSocket from "../hooks/useSocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SearchUsers from "./SearchUsers";
import { Search } from "lucide-react";

type ChatRoom = {
  _id: string;
  name: string;
  users: {
    _id: string;
    profilePicture: string;
    name: string;
  }[];
  lastMessage: string;
  type: "private" | "group";
  groupName?: string;
  groupImage?: string;
};

type ChatItemProps = {
  profilePicture: string;
  name: string;
  senderID: string;
  chatRoomID: string;
  message: string;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatItem | null>>;
  type: "private" | "group";
  groupName?: string;
  groupImage?: string;
};

type ChatItem = {
  profilePicture: string;
  name: string;
  message: string;
  _id: string;
  senderID: string;
  type: "private" | "group";
  groupName?: string;
  groupImage?: string;
};

const ChatsPage = () => {
  const { user } = useAuth();
  const socket = useSocket(user?.token);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messageText, setMessageText] = useState("");
  const [chatRoomMessages, setChatRoomMessages] = useState([]);
  const { data, isLoading, error } = useSWR<ChatRoom[]>("/chatrooms", fetcher);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket && selectedChat) {
      //@ts-ignore
      socket.emit("joinRoom", selectedChat._id);

      //@ts-ignore
      socket.on("newMessage", (message) => {
        //@ts-ignore
        setChatRoomMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      });

      return () => {
        //@ts-ignore
        socket.emit("leaveRoom", selectedChat._id);
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          const response = await axiosInstance.get(
            `/messages/chatroom/${selectedChat._id}`
          );
          setChatRoomMessages(response.data);
          scrollToBottom();
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (selectedChat && messageText.trim()) {
      try {
        const response = await axiosInstance.post(`/messages`, {
          content: messageText,
          chatRoom: selectedChat._id,
        });
        //@ts-ignore
        socket.emit("sendMessage", response.data);
        setMessageText("");
        scrollToBottom();
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error loading chats</h1>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-4xl font-bold mb-7">Chats</h1>
        <Dialog>
          <DialogTrigger>
            <Button variant={"secondary"}>
              <Search className="w-5 h-5 mx-2" />
              <p>Search users</p>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search User</DialogTitle>
              <DialogDescription className="h-60">
                <SearchUsers setSelectedChat={setSelectedChat} />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 h-[70vh]">
        <div
          className={`flex gap-3 basis-2/4 flex-col overflow-auto ${
            selectedChat && "hidden sm:flex"
          }`}
        >
          {data && data.length > 0 ? (
            data.map((chatRoom) =>
              chatRoom.type === "private"
                ? chatRoom.users
                    .filter((u) => u._id !== user?._id)
                    .map((u) => (
                      <ChatItem
                        key={u._id}
                        senderID={u._id}
                        setSelectedChat={setSelectedChat}
                        chatRoomID={chatRoom._id}
                        profilePicture={u.profilePicture}
                        name={u.name}
                        message={chatRoom.lastMessage}
                        type="private"
                      />
                    ))
                : chatRoom.type === "group" && (
                    <ChatItem
                      key={chatRoom._id}
                      senderID={chatRoom._id}
                      setSelectedChat={setSelectedChat}
                      chatRoomID={chatRoom._id}
                      profilePicture={
                        chatRoom.groupImage ||
                        "https://i.pinimg.com/564x/e7/22/3b/e7223b49e4a8d006798f795c236ca54f.jpg"
                      }
                      name={chatRoom.name}
                      message={chatRoom.lastMessage}
                      type="group"
                    />
                  )
            )
          ) : (
            <p>No chat rooms available</p>
          )}
        </div>
        <div
          className={`${
            selectedChat ? "sm:flex" : "hidden"
          } flex-col justify-between outline outline-secondary w-full rounded p-4`}
        >
          {selectedChat ? (
            <div>
              <div className="flex border-b-2 p-3 gap-3 items-center">
                <Avatar>
                  <AvatarImage src={selectedChat.profilePicture}></AvatarImage>
                </Avatar>
                {selectedChat.type === "private" ? (
                  <Link
                    href={`/profile/${selectedChat.senderID}`}
                    className="text-xl font-bold"
                  >
                    {selectedChat.name}
                  </Link>
                ) : (
                  <p className="text-xl font-bold">{selectedChat.name}</p>
                )}
              </div>
              <div
                ref={messagesEndRef}
                className="flex overflow-y-visible h-80 mt-4 flex-col gap-1 items-stretch overflow-auto"
              >
                {chatRoomMessages.map((message: any, index) => (
                  <MessageItem
                    senderUsername={message.sender.username}
                    key={index}
                    senderID={message.sender._id}
                    userID={user?._id}
                    content={message.content}
                    chatType={selectedChat.type}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>Select a chat to view details</p>
          )}
          <div className="flex gap-2 items-stretch">
            <Input
              value={messageText}
              placeholder="Send message..."
              className="py-5 px-5"
              type="text"
              onChange={(e) => setMessageText(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageItem = ({
  userID,
  senderID,
  content,
  senderUsername,
  chatType,
}: {
  userID?: string;
  senderID: string;
  content: string;
  senderUsername: string;
  chatType: string;
}) => {
  return (
    <div
      className={`rounded-xl px-4 py-1 ${
        senderID === userID
          ? "self-end bg-secondary-foreground text-secondary"
          : "self-start bg-primary text-primary-foreground"
      }`}
    >
      <div className="flex flex-col-reverse">
        <p>{content}</p>
        {chatType === "group" && (
          <p className="text-xs text-muted-foreground">{senderUsername}</p>
        )}
      </div>
    </div>
  );
};
const ChatItem = ({
  profilePicture,
  name,
  message,
  chatRoomID,
  senderID,
  setSelectedChat,
  type,
  groupName,
  groupImage,
}: ChatItemProps) => {
  const setChat = () => {
    setSelectedChat({
      name: name,
      senderID,
      _id: chatRoomID,
      profilePicture:
        type === "group"
          ? groupImage ||
            "https://i.pinimg.com/564x/e7/22/3b/e7223b49e4a8d006798f795c236ca54f.jpg"
          : profilePicture,
      message,
      type,
    });
  };

  return (
    <Card
      onClick={setChat}
      className="flex flex-row p-3 gap-2 items-center cursor-pointer hover:bg-secondary"
    >
      <Avatar>
        <AvatarImage src={profilePicture} alt={`${name}'s profile picture`} />
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{name}</p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </Card>
  );
};

export default ChatsPage;
