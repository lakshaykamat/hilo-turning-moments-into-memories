"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const { logout, setNewProfilePhoto } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const changeProfilePicture = async () => {
    const url = prompt("Enter image URL");
    if (!url) return;

    setLoading(true);
    try {
      await setNewProfilePhoto(url);
      //TODO Show Toast Profile picture added
    } catch (err) {
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      setError("Failed to logout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl sm:text-4xl font-bold mb-7">Settings</h1>
      <div className="flex justify-between items-center mb-4">
        <p>Change profile picture</p>
        <Button onClick={changeProfilePicture} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div>
        <Button onClick={handleLogout} variant="destructive" disabled={loading}>
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </>
  );
};

export default SettingsPage;
