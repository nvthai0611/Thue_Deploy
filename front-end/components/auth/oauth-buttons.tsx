import { signInWithOAuthAction } from "@/app/actions";
import React from "react";
import { SubmitButton } from "../submit-button";
import { FacebookIcon } from "../icon/facebook-icon";
import { GoogleIcon } from "../icon/google-icon";

export default function OAuthButtons() {
  return (
    <>
      <div className="flex items-center gap-2 my-4">
        <span className="flex-1 h-px bg-muted" />
        <span className="text-sm text-background text-center">
          Or sign in by
        </span>
        <span className="flex-1 h-px bg-muted" />
      </div>
      <div className="flex justify-center gap-4 mb-5">
        <form
          action={async () => {
            "use server";
            const formData = new FormData();
            formData.append("provider", "facebook");
            return signInWithOAuthAction(formData);
          }}
          className="w-1/2"
        >
          <SubmitButton className="border-background border w-full">
            <FacebookIcon className="mr-1" />
            Facebook
          </SubmitButton>
        </form>
        <form
          action={async () => {
            "use server";
            const formData = new FormData();
            formData.append("provider", "google");
            return signInWithOAuthAction(formData);
          }}
          className="w-1/2"
        >
          <SubmitButton className="border-background border w-full">
            <GoogleIcon className="mr-1" />
            Google
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
