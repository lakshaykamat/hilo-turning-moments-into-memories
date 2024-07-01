"use client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance from "./axios";
import { User } from "@/types/User";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const ISSERVER = typeof window === "undefined";
export const LocalStorageHandler = {
  addUserToken: (data: any) => {
    if (!ISSERVER) {
      localStorage.setItem("authToken", JSON.stringify(data));
    }
  },
  getUserToken: (): User | null => {
    if (!ISSERVER) {
      const data = window.localStorage.getItem("authToken");
      if (data != null) {
        return JSON.parse(data);
      } else {
        return null;
      }
    } else {
      return null;
    }
  },
  removeUserToken: () => {
    if (!ISSERVER) {
      localStorage.removeItem("authToken");
    }
  },
};
export const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);
