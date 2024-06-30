import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance from "./axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const LocalStorgeHandler = {
  addUserToken: (data) => {
    localStorage.setItem("authToken", JSON.stringify(data));
  },
  getUserToken: () => {
    const data = localStorage.getItem("authToken");
    if (data != null) {
      return JSON.parse(data);
    } else {
      return null;
    }
  },
  removeUserToken: () => {
    localStorage.removeItem("authToken");
  },
};
export const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);
