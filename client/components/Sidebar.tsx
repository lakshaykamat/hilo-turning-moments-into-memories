"use client";
import {
  Home,
  House,
  Pen,
  Podcast,
  Settings,
  Settings2,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axios";
import { useToast } from "./ui/use-toast";
// import { useHistory } from "react-router-dom";
import { ToastAction } from "./ui/toast";
import { ModeToggle } from "./ModeToggle";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [postContent, setPostContent] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPost = async () => {
    setLoading(true);
    if (!postContent) return;
    try {
      const response = await axiosInstance.post("/posts", {
        content: postContent,
      });
      if (response.data) {
        toast({
          title: "Post uploaded",
          description: "Check profile",
          action: <ToastAction altText="View Post">View Post</ToastAction>,
        });
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || error.message,
        description: "Failed To Upload",
      });
      console.log(error);
    }
    setLoading(false);
  };
  return (
    <Card className="rounded-none fixed flex-col justify-between hidden h-screen px-10 md:flex py-28 min-w-72 max-w-72 drop-shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-primary mb-7">SyncTalk</h1>
        <div className="flex flex-col gap-6">
          <div>
            <a
              href={"/"}
              className={`${
                pathname === "/" && "bg-primary dark:text-black text-white"
              } flex gap-2 p-3 rounded hover:cursor-pointer hover:outline-2 hover:outline outline-gray-300`}
            >
              <Home />
              <span className="">Home</span>
            </a>
          </div>

          <Dialog>
            <DialogTrigger>
              <div>
                <span
                  className={`flex gap-2 p-3 rounded hover:cursor-pointer hover:outline-2 hover:outline outline-gray-300`}
                >
                  <Pen />
                  <span>Create Post</span>
                </span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-3 text-2xl">Create Post</DialogTitle>
                <DialogDescription className="flex flex-col gap-3 my-4">
                  <Textarea
                    className="text-primary h-32"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your thougts..."
                  />
                  <DialogClose asChild>
                    <Button onClick={createPost} disabled={isLoading}>
                      {isLoading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogClose>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <div>
            <a
              href={"/profile"}
              className={`${
                pathname === "/profile" &&
                "bg-primary dark:text-black text-white"
              } flex gap-2 p-3 rounded hover:cursor-pointer hover:outline-2 hover:outline outline-gray-300`}
            >
              <User />
              <span className="">Profile</span>
            </a>
          </div>
          <div>
            <a
              href={"/settings"}
              className={`${
                pathname === "/settings" &&
                "bg-primary dark:text-black text-white"
              } flex gap-2 p-3 rounded hover:cursor-pointer hover:outline-2 hover:outline outline-gray-300`}
            >
              <Settings />
              <span className="">Settings</span>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};
const BottomBar = () => {
  const [postContent, setPostContent] = useState("");
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPost = async () => {
    setLoading(true);
    if (!postContent) return;
    try {
      const response = await axiosInstance.post("/posts", {
        content: postContent,
      });
      if (response.data) {
        toast({
          title: "Post uploaded",
          description: "Check profile",
          action: <ToastAction altText="View Post">View Post</ToastAction>,
        });
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || error.message,
        description: "Failed To Upload",
      });
      console.log(error);
    }
    setLoading(false);
  };
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 flex w-full md:hidden">
      <div className="flex items-center justify-center w-full gap-12 bg-card drop-shadow">
        <a
          href="/"
          className={`flex flex-col items-center text-sm justify-center py-4 rounded px-3 sm:px-7 ${
            pathname === "/" ? "bg-primary text-white" : "hover:bg-secondary"
          }`}
        >
          <Home />
        </a>

        <Dialog>
          <DialogTrigger>
            <div
              className={`flex flex-col items-center text-sm justify-center py-4 rounded px-3 sm:px-7`}
            >
              <Pen />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-3 text-2xl">Create Post</DialogTitle>
              <DialogDescription className="flex flex-col gap-3 my-4">
                <Textarea
                  className="text-primary"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your thougts..."
                />
                <DialogClose asChild>
                  <Button onClick={createPost} disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogClose>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <a
          href="/profile"
          className={`flex flex-col items-center text-sm justify-center py-4 rounded px-3 sm:px-7 ${
            pathname === "/profile"
              ? "bg-primary text-white"
              : "hover:bg-secondary"
          }`}
        >
          <User />
        </a>
        <a
          href="/settings"
          className={`flex flex-col items-center text-sm justify-center py-4 rounded px-3 sm:px-7 ${
            pathname === "/settings"
              ? "bg-primary text-white"
              : "hover:bg-secondary"
          }`}
        >
          <Settings />
        </a>
      </div>
    </div>
  );
};
export { Sidebar, BottomBar };
