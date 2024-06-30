import React from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

const TopBar = () => {
  return (
    <div className="md:ml-[18rem] py-5 border-2 bg-card px-7">
      <div className="flex items-center max-w-sm gap-3">
        <Search />
        <Input placeholder="Search..." />
      </div>
    </div>
  );
};

export default TopBar;
