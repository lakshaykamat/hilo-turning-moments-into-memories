"use client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axiosInstance from "./axios";
import { User } from "@/types/User";

export const formatTimestamp = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  return "just now";
};

export const formatDate = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  const [day, month, year, time] = formattedDate.replace(",", "").split(" ");

  return `${month} ${day} ${year} ${time}`;
};
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
