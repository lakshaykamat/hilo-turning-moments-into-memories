"use client";
import { fetcher } from "@/lib/utils";
import React from "react";
import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import { Post } from "@/types/Post";
import PostCard from "@/components/PostCard";
import ProfileComponent from "./ProfileComponent";

const ProfilePage = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useSWR(`/users/${user?._id}`, fetcher); //* Fetches users deatils by userID

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...{JSON.stringify(error)}</h1>;

  if (data && user) {
    return (
      <>
        <h1 className="text-2xl sm:text-4xl font-bold mb-7">Profile</h1>
        <ProfileComponent
          profilePicture={data.profilePicture}
          name={data.name}
          username={data.username}
          posts={data.posts}
        />
      </>
    );
  }
};

export default ProfilePage;
