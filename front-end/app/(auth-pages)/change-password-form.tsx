"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/form-message";
import { resetPasswordAction } from "@/app/actions";
import logo from "@/assets/HolaRental.png";
import { useSearchParams } from "next/navigation";

export default function ChangePasswordForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");
  const formMessage = error ? { error } : message ? { message } : undefined;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (confirm && password !== confirm) {
      setClientError("Passwords do not match");
    } else {
      setClientError(null);
    }
  }, [password, confirm]);

  return (
    <Card className="bg-card-foreground mx-auto p-12">
      <Image src={logo} alt="HolaRental" className={"w-2/3 mx-auto"} />
      <form className="flex flex-col mx-auto" action={resetPasswordAction}>
        <div>
          <h1 className="text-2xl font-medium text-background">
            Reset Password
          </h1>
          <p className="text-sm text-primary-foreground">
            Set a new password for your account{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="password" className="text-primary-foreground">
            New Password
          </Label>
          <Input
            name="password"
            type="password"
            placeholder="Your new password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Label htmlFor="confirmPassword" className="text-primary-foreground">
            Confirm Password
          </Label>
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {clientError ? (
            <div className="text-red-500 text-xs font-semibold">
              {clientError}
            </div>
          ) : confirm && password && password === confirm ? (
            <div className="text-green-600 text-xs font-semibold">
              Passwords match
            </div>
          ) : null}
          <SubmitButton
            className="bg-red-700 hover:bg-red-800 text-white"
            disabled={!!clientError}
          >
            Reset
          </SubmitButton>
          {formMessage && <FormMessage message={formMessage} />}
        </div>
      </form>
    </Card>
  );
}
