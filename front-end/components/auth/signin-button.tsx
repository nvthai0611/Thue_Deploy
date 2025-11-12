"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function SignInButton() {
  const pathname = usePathname();
  const router = useRouter();
  const handleSignIn = () => {
    localStorage.setItem("redirectUrl", pathname);
    router.push("/sign-in");
  };

  return (
    <Button size="sm" variant="outline" onClick={handleSignIn}>
      Đăng nhập
    </Button>
  );
}
