"use client";
import { fetcher } from "@/lib/utils";
import React from "react";
import useSWR from "swr";

type Props = {};

const PostPage = ({ params }: { params: { postId: string } }) => {
  const { data, isLoading, error } = useSWR(`/posts/${params.postId}`, fetcher);
  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>error {JSON.stringify(error)}</h1>;
  if (data) return JSON.stringify(data);
};

export default PostPage;
