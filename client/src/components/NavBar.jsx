import React from "react";
import { Button } from "./ui/button";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between gap-12 p-5 bg-secondary">
      <h3 className="text-2xl font-semibold tracking-tight scroll-m-20">
        SyncTalk
      </h3>
      <div className="flex gap-12">
        <a className="hover:cursor-pointer hover:underline" href="/">
          Home
        </a>
        <a className="hover:cursor-pointer hover:underline" href="/about">
          About
        </a>
        <a className="hover:cursor-pointer hover:underline" href="/contactus">
          Contact Us
        </a>
      </div>
      <div>
        <Button>Login</Button>
      </div>
    </nav>
  );
};

export default NavBar;
