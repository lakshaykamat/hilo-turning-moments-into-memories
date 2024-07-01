"use client";
import axiosInstance from "@/lib/axios";
import { LocalStorageHandler } from "@/lib/utils";
import { User } from "@/types/User";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextProps {
  user: User | null;
  login: (username: string, password: string) => Promise<any>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userAuth, setUserAuth] = useState<User | null>(
    LocalStorageHandler.getUserToken()
  );

  const router = useRouter();

  useEffect(() => {
    const userInfo = LocalStorageHandler.getUserToken();
    setUserAuth(userInfo);

    if (!userInfo) router.push("/login");
  }, [router]);

  const login = async (username: string, password: string): Promise<any> => {
    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });
      if (response.data) {
        setUserAuth(response.data);
        LocalStorageHandler.addUserToken(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post("/users/register", {
        name,
        username,
        email,
        password,
      });
      if (response.data) {
        setUserAuth(response.data);
        LocalStorageHandler.addUserToken(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    LocalStorageHandler.removeUserToken();
    setUserAuth(null); // Reset userAuth state on logout
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user: userAuth, register, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
