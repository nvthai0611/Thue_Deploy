"use client";

import { verifyOtpAction } from "@/app/actions";
import logo from "@/assets/HolaRental.png";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function OtpForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const reset = searchParams.get("reset") || "";
  const message = searchParams.get("message");
  const error = searchParams.get("error");
  const [otp, setOtp] = useState<string>("");
  const formMessage = message ? { message } : error ? { error } : undefined;

  return (
    <Card className="bg-card-foreground w-full max-w-md p-6">
      <Image src={logo} alt="HolaRental" className={"w-2/3 mx-auto"} />
      <form action={verifyOtpAction}>
        <h1 className="text-2xl text-background font-semibold">
          OTP Verification
        </h1>
        <br />
        <p className="text-sm text-muted-foreground">
          Please enter the OTP sent to phone number:
        </p>
        <p className="text-sm font-semibold text-background">{phone}</p>
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="reset" value={reset} />
        <InputOTP maxLength={6} value={otp} onChange={setOtp} name="otp">
          <InputOTPGroup className="mx-auto my-5 w-full flex justify-between">
            <InputOTPSlot index={0} className="text-background" />
            <InputOTPSlot index={1} className="text-background" />
            <InputOTPSlot index={2} className="text-background" />
            <InputOTPSlot index={3} className="text-background" />
            <InputOTPSlot index={4} className="text-background" />
            <InputOTPSlot index={5} className="text-background" />
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          className="bg-red-700 hover:bg-red-800 w-full mx-auto block text-white mb-5"
          disabled={otp.length !== 6}
        >
          Verify OTP
        </Button>
        {formMessage && <FormMessage message={formMessage} />}
        <p className="text-background text-center text-xs mt-10">
          Need help?{" "}
          <Link href="/contact" className="text-blue-500 underline">
            Contact for help
          </Link>
        </p>
      </form>
    </Card>
  );
}
