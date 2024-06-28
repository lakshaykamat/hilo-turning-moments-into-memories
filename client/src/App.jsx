import React from "react";
import useSWR from "swr";
import axios from "axios";
import axiosInstance from "./lib/axios";

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

const App = () => {
  const { data, error, isLoading } = useSWR("/user", fetcher);
  if (isLoading) return <h1>Loading...</h1>;

  return <div>{JSON.stringify(data)}</div>;
};

export default App;
