import OtpForm from "@/components/auth/otp-form";
import { Suspense } from "react";

export default async function Otp() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
