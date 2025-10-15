"use client";
import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function ClearUserStorage() {
  useEffect(() => {
    useUserStore.persist.clearStorage();
  }, []);
  return null;
}
