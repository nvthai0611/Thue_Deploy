"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectUrl = localStorage.getItem("redirectUrl");
    if (redirectUrl) {
      localStorage.removeItem("redirectUrl");
      router.replace(redirectUrl);
    } else {
      router.replace("/");
    }
  }, [router]);

  return <p>Redirecting...</p>;
}
