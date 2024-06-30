import { fetcher } from "@/lib/utils";
import React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const PostPage = () => {
  const { postId } = useParams();
  const { data, isLoading, error } = useSWR(`/posts/${postId}`, fetcher);
  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error {JSON.stringify(error)}</h1>;

  if (data) {
    return JSON.stringify(data);
  }
};

export default PostPage;
