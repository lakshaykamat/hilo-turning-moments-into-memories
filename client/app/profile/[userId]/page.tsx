"use client";
import { fetcher } from "@/lib/utils";
import React from "react";
import useSWR from "swr";
import ProfileComponent from "../ProfileComponent";

const ProfilePageOfUser = ({ params }: { params: { userId: string } }) => {
  const { data, isLoading, error } = useSWR(`/users/${params.userId}`, fetcher); //* Fetches user details by userID

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error...</h1>;
  if (data) {
    return (
      <>
        <h1 className="text-4xl font-bold mb-7">Profile</h1>
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

export default ProfilePageOfUser;
