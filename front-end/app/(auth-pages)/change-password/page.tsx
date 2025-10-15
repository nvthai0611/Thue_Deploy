import ChangePasswordForm from "@/app/(auth-pages)/change-password-form";
import { Suspense } from "react";

export default async function ChangePassword() {
  return (
    <Suspense>
      <ChangePasswordForm />
    </Suspense>
  );
}
