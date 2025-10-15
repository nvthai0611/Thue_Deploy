"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { Provider } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    return siteUrl;
  }

  // Only use header origin in development
  if (process.env.NODE_ENV === "development") {
    return (await headers()).get("origin") || "http://localhost:3000";
  }

  // Production fallback
  return "https://hola-rental-client.onrender.com";
}

export const signUpAction = async (formData: FormData) => {
  const phone = formData.get("phone")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const supabase = await createClient();

  if (!phone || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Phone and password are required"
    );
  }

  // Check if user already exists in public.users
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id, phone, phone_confirmed, auth_user_id")
    .eq("phone", phone)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Database error:", checkError);
    return encodedRedirect(
      "error",
      "/sign-up",
      "An error occurred while checking user information"
    );
  }

  // If user already exists and is confirmed
  if (
    existingUser &&
    existingUser.phone_confirmed &&
    existingUser.auth_user_id
  ) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "This phone number is already registered"
    );
  }

  // Send OTP with name in metadata for trigger to access
  if (!existingUser || !existingUser.phone_confirmed) {
    console.log("exist");

    // Send OTP with name in metadata for trigger to access
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: "sms",
        data: {
          name: name || "",
        },
      },
    });

    if (error) {
      console.error(error.code + " " + error.message);
      return encodedRedirect("error", "/sign-up", error.message);
    } else {
      return redirect(
        `/otp?phone=${encodeURIComponent(phone!)}&password=${encodeURIComponent(password!)}`
      );
    }
  }
};

export const signInAction = async (formData: FormData) => {
  const phone = formData.get("phone")?.toString();
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!phone) {
    return encodedRedirect("error", "/sign-in", "Phone is required");
  }

  // Check user in public.users first
  const { data: publicUser, error: publicError } = await supabase
    .from("users")
    .select("id, phone, phone_confirmed, is_active, auth_user_id")
    .eq("phone", phone)
    .single();

  if (publicError && publicError.code !== "PGRST116") {
    console.error("Error checking public user:", publicError);
    return encodedRedirect(
      "error",
      "/sign-in",
      "An error occurred while checking user information"
    );
  }

  if (!publicUser) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "This phone number is not registered"
    );
  }

  if (!publicUser.phone_confirmed || !publicUser.auth_user_id) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Account has not been verified. Please complete registration"
    );
  }

  if (!publicUser.is_active) {
    return encodedRedirect("error", "/sign-in", "Account has been disabled");
  }

  // Proceed with login
  const { error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/redirect");
};

export const signInWithOAuthAction = async (formData: FormData) => {
  const provider = formData.get("provider") as Provider; // "facebook" or "google"
  const supabase = await createClient();
  const origin = await getOrigin();

  if (!provider) {
    return encodedRedirect("error", "/sign-in", "Provider is required");
  }

  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL ||
      "https://holarental.website";
  const redirectTo = `${baseUrl}/auth/callback`;

  console.log("Sending redirectTo to Supabase:", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("OAuth error:", error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (data.url) {
    console.log("Redirecting to:", data.url);
    return redirect(data.url);
  }

  return encodedRedirect("error", "/sign-in", "No redirect URL provided");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const phone = formData.get("phone")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!phone) {
    return encodedRedirect("error", "/forgot-password", "Phone is required");
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: "sms",
    },
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not send OTP to your phone"
    );
  }

  return redirect(
    `/otp?phone=${encodeURIComponent(phone)}&reset=1${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be logged in to reset your password"
    );
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect("error", "/reset-password", "Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect("error", "/reset-password", "Password update failed");
  }

  await supabase.auth.signOut();

  return encodedRedirect(
    "success",
    "/sign-in",
    "Password updated successfully. Please sign in with your new password."
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
};

export const verifyOtpAction = async (formData: FormData) => {
  const phone = formData.get("phone")?.toString();
  const otp = formData.get("otp")?.toString();
  const reset = formData.get("reset")?.toString();
  const supabase = await createClient();

  if (!phone || !otp) {
    return encodedRedirect(
      "error",
      `/otp?phone=${encodeURIComponent(phone || "")}&reset=${reset || ""}`,
      "Phone number and OTP are required"
    );
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: "sms",
  });

  if (error) {
    return encodedRedirect(
      "error",
      `/otp?phone=${encodeURIComponent(phone)}&reset=${reset || ""}`,
      "Invalid or expired OTP: " + error.message
    );
  }

  if (reset === "1") {
    return redirect(`/change-password?phone=${encodeURIComponent(phone)}`);
  }

  return redirect("/sign-in?message=OTP verified successfully");
};
