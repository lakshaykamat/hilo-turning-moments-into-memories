"use client";
import Link from "next/link";
import { NotFoundIllustration } from "./Illustration";
import { Button } from "@/components/ui/button";
import MetaTag from "./MetaTags";

export default function NotFound() {
  return (
    <>
      <MetaTag />
      <div className="dark:hidden mx-auto max-w-sm text-center">
        <NotFoundIllustration.Dark />
        <p className="my-3">Page not found return to home</p>
        <Link href={`/`}>
          <Button>Home</Button>
        </Link>
      </div>
      <div className="dark:block hidden mx-auto max-w-sm text-center">
        <NotFoundIllustration.Light />
        <p className="my-3">Page not found return to home</p>
        <Link href={`/`}>
          <Button>Home</Button>
        </Link>
      </div>
    </>
  );
}
