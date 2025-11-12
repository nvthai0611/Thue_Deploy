"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function SignUpButton() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignUp = () => {
    localStorage.setItem("redirectUrl", pathname);
    router.push("/sign-up");
  };

  return (
    <Button size="sm" variant="default" onClick={handleSignUp}>
      Đăng ký
    </Button>
  );
}
