"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import React from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const changeProfilePicture = async () => {
    const url = prompt("Enter image url");
    if (url) {
      const response = await axiosInstance.put(
        "/users/change-profile-picture",
        { image: url }
      );
      if (response.data) {
        router.push("/profile");
      }
    }
  };
  return (
    <>
      <h1 className="text-4xl font-bold mb-7">Settings</h1>
      <div className="flex justify-between">
        <p>Change profile picture</p>
        <Button onClick={changeProfilePicture}>Upload</Button>
      </div>
      <div>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>
    </>
  );
};

export default SettingsPage;
