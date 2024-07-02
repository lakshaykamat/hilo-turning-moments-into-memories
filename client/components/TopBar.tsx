"use client";
import React from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

const TopBar = () => {
  return (
    <div className="md:ml-[18rem] flex justify-between py-5 border-2 bg-card px-7">
      <div className="flex items-center max-w-sm gap-3">
        <Search />
        <Input placeholder="Search..." />
      </div>
      <div>
        <ModeToggle />
      </div>
    </div>
  );
};

export default TopBar;
