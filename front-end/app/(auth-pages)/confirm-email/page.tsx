"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  unlinkProvider,
  checkNeedUnlink,
} from "@/utils/supabase/change-email-phone";

const supabase = createClient();

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("...");
  const [showUnlinkOption, setShowUnlinkOption] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unlinkInfo, setUnlinkInfo] = useState<any>({});

  const handleUnlinkGoogle = async (type: string) => {
    setMessage("Unlinking Google...");
    const result = await unlinkProvider(type);

    if (result.success) {
      setMessage(
        "✅ Google link unlinked successfully! Old email can no longer be used to log in.\n\nYou can now only log in with the new email."
      );
      setShowUnlinkOption(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserInfo(user);
    } else {
      setMessage(
        `❌ Unlink error: ${result.message}\n\nYou can try again or contact support.`
      );
    }
  };

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        const token_hash = searchParams.get("token_hash");
        const code = searchParams.get("code");
        const type = searchParams.get("type");
        const action = searchParams.get("action");
        const urlMessage = searchParams.get("message");
        const next = searchParams.get("next") ?? "/";

        if (urlMessage && !code && !token_hash) {
          setMessage(
            "✅ Old email confirmation successful! Please check your new email to complete the change."
          );
          setIsLoading(false);
          return;
        }

        if (token_hash && type) {
          console.log("Case 2: Token hash verification");
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as EmailOtpType,
          });

          if (error) {
            console.error("Verify error:", error);
            setMessage(`Lỗi xác nhận: ${error.message}`);
            setIsLoading(false);
            return;
          }

          await handleSuccessfulVerification();
        } else if (code && action === "change_email") {
          console.log("Case 3: Code verification for email change");
          const verificationMethods: Array<{
            token_hash: string;
            type: EmailOtpType;
          }> = [
            { token_hash: code, type: "email_change" as EmailOtpType },
            { token_hash: code, type: "email" as EmailOtpType },
            { token_hash: code, type: "signup" as EmailOtpType },
          ];

          let verificationSuccess = false;

          for (const method of verificationMethods) {
            try {
              console.log("Trying verification method:", method);
              const { error } = await supabase.auth.verifyOtp(method);

              if (!error) {
                console.log("Verification successful with method:", method);
                verificationSuccess = true;
                await handleSuccessfulVerification();
                break;
              } else {
                console.log("Method failed:", method, error.message);
              }
            } catch (err) {
              console.log("Method error:", method, err);
            }
          }

          if (!verificationSuccess) {
            console.log(
              "All verification methods failed, checking current user status"
            );
            await checkCurrentUserStatus();
          }
        } else {
          if (urlMessage) {
            setMessage(decodeURIComponent(urlMessage));
          } else {
            setMessage("The confirmation link is invalid or expired.");
          }
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        setMessage("System error while confirming email.");
      } finally {
        setIsLoading(false);
      }
    };

    const checkCurrentUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Current user status:", user);

      if (user) {
        setUserInfo(user);
        const oldEmail = searchParams.get("oldEmail");
        const decodedOldEmail = oldEmail ? decodeURIComponent(oldEmail) : "";

        if (user.email !== decodedOldEmail) {
          console.log(
            "Email change detected:",
            decodedOldEmail,
            "->",
            user.email
          );
          await handleSuccessfulVerification();
        } else {
          setMessage(
            "❌ The confirmation link has expired. Please try changing your email again."
          );
        }
      } else {
        setMessage("❌ Unable to authenticate. Please log in again.");
      }
    };

    const handleSuccessfulVerification = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User after verify:", user);

      if (user) {
        setUserInfo(user);
        const unlinkCheck = await checkNeedUnlink();
        console.log("Unlink check:", unlinkCheck);
        setUnlinkInfo(unlinkCheck);

        if (unlinkCheck.needUnlink) {
          setMessage(
            `✅ Email has been changed successfully!\n\nNew Email: ${user.email}\n\n⚠️ However, you can still sign in with Google with your old email. (${unlinkCheck.googleEmail}).\n\nFor security, please disable Google link.`
          );
          setShowUnlinkOption(true);
        } else {
          setMessage(
            "✅ Email has been changed successfully! Old email can no longer be logged in."
          );
        }
      }
    };

    handleConfirmation();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Confirm received email
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}

          <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>

          {showUnlinkOption && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="text-left">
                <h3 className="font-bold text-yellow-800 mb-2">
                  ⚠️ Security warning
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Currently you can log in in 2 ways:
                </p>
                <ul className="text-sm text-yellow-800 mb-3 list-disc list-inside">
                  <li>
                    <strong>New email:</strong> {userInfo?.email}
                  </li>
                  <li>
                    <strong>Google (old email):</strong>{" "}
                    {unlinkInfo.googleEmail}
                  </li>
                </ul>
                <p className="text-sm text-yellow-800 mb-4">
                  To ensure the old email can no longer be used to log in,
                  unlink Google:
                </p>
              </div>
              <button
                onClick={() => handleUnlinkGoogle("google")}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 text-sm font-medium"
              >
                🔗 Unlink Google (Recommended)
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full mt-2 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200 text-sm"
              >
                Skip (not recommended)
              </button>
            </div>
          )}

          {!isLoading && !showUnlinkOption && (
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Back Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
