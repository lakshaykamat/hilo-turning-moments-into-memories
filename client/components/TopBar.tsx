"use client";
import React from "react";
import { Input } from "./ui/input";
import { MessageSquare, Search } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "./ui/button";
import Link from "next/link";

const TopBar = () => {
  const { user } = useAuth();

  return (
    <div className="md:ml-[18rem] items-center flex justify-between py-5 border bg-card px-7">
      <h1 className="text-xl font-bold">SyncTalk</h1>

      <div className="flex gap-3 items-center">
        <Link href={`/chats`}>
          <Button className="flex gap-1">
            <MessageSquare />
            <p>Chats</p>
          </Button>
        </Link>
        <ModeToggle />

        <Avatar>
          <AvatarImage
            src={
              user
                ? user.profilePicture
                : "https://i.pinimg.com/564x/7c/3c/97/7c3c978ebca761862373cdc8e776f5ec.jpg"
            }
            alt={user ? user.name : "LK"}
          />
          <AvatarFallback>{"$"}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default TopBar;
