import { fetcher } from "@/lib/utils";
import React from "react";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR("/users", fetcher);
  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error{JSON.stringify(error.message)}</h1>;
  return (
    <>
      <h1 className="text-4xl font-bold mb-7">Home</h1>
      <div>
        {data &&
          data.map((user) => {
            return (
              <User
                name={user.name}
                profilePicture={user.profilePicture}
                username={user.username}
              />
            );
          })}
      </div>
    </>
  );
};
const User = (props) => {
  return (
    <Card className="flex items-center max-w-sm gap-3 px-5 py-3 ">
      <img className="w-20 rounded-full" src={props.profilePicture} alt="" />
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">{props.name}</h1>
        <h1 className="">{props.username}</h1>
      </div>
    </Card>
  );
};

export default HomePage;
