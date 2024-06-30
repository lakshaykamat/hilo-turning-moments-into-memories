import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { useHistory } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  return (
    <div className="max-w-sm mx-auto my-12">
      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="login">
            Login
          </TabsTrigger>
          <TabsTrigger className="w-full" value="register">
            Register
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginCard />
        </TabsContent>
        <TabsContent value="register">
          <RegisterCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const LoginCard = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await login(username, password);
      if (data) {
        history.push("/");
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || error.message);
    }
  };
  return (
    <Card className="p-5 mx-auto">
      <h1 className="mb-4 text-2xl font-bold tracking-tight scroll-m-20">
        Login
      </h1>
      <form className="flex flex-col gap-4">
        <div>
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter Username"
          />
        </div>
        <div>
          <Label>Password </Label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Enter Username"
          />
        </div>
      </form>
      <p className="mt-5 text-sm font-semibold text-red-500">{error}</p>
      <Button
        onClick={handleLogin}
        className="w-full mt-5"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Login"}
      </Button>
    </Card>
  );
};
const RegisterCard = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();

  const registerUser = async () => {
    try {
      const data = await register(name, username, email, password);
      if (data) {
        history.push("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };
  return (
    <Card className="p-5 mx-auto">
      <h1 className="mb-4 text-2xl font-bold tracking-tight scroll-m-20">
        Register
      </h1>
      <div className="flex flex-col gap-4">
        <div>
          <Label>Name</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Enter name"
          />
        </div>
        <div>
          <Label>Username</Label>
          <Input
            onChange={(e) => setUsername(e.target.value)}
            required
            value={username}
            type="text"
            placeholder="Enter usename"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            required
            value={email}
            type="email"
            placeholder="Enter email"
          />
        </div>
        <div>
          <Label>Password </Label>
          <Input
            onChange={(e) => setPassword(e.target.value)}
            required
            value={password}
            type="password"
            placeholder="Enter Password"
          />
        </div>
      </div>
      <p className="mt-5 text-sm font-semibold text-red-500">{error}</p>
      <Button onClick={registerUser} className="w-full mt-5">
        Register
      </Button>
    </Card>
  );
};
export default LoginPage;
