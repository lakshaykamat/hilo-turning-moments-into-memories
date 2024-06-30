// AuthContext.js
import axiosInstance from "@/lib/axios";
import { LocalStorgeHandler } from "@/lib/utils";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userAuth, setUserAuth] = useState(LocalStorgeHandler.getUserToken());

  const history = useHistory();

  useEffect(() => {
    const userInfo = LocalStorgeHandler.getUserToken();
    setUserAuth(userInfo);

    if (!userInfo) history.push("/login");
  }, [history]);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });
      if (response.data) {
        setUserAuth(response.data);
        LocalStorgeHandler.addUserToken(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, username, email, password) => {
    try {
      const response = await axiosInstance.post("/users/register", {
        name,
        username,
        email,
        password,
      });
      if (response.data) {
        setUserAuth(response.data);
        LocalStorgeHandler.addUserToken(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    LocalStorgeHandler.removeUserToken();
    history.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user: userAuth, register, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
