import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import React from "react";

const SettingsPage = () => {
  const { logout } = useAuth();
  return (
    <>
      <h1 className="text-4xl font-bold mb-7">Settings</h1>
      <div>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>
    </>
  );
};

export default SettingsPage;
