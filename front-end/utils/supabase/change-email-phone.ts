import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const updateUserEmail = async (email: string) => {
  try {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return {
        success: false,
        message: "Invalid email",
      };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: "Please login before changing email",
      };
    }

    // Kiểm tra xem user có nhiều providers không
    const providers = user.app_metadata?.providers || [];
    const hasMultipleProviders = providers.length > 1;

    if (hasMultipleProviders) {
      console.warn("User có nhiều providers:", providers);
    }

    const oldEmail = user.email || "";

    const { data, error } = await supabase.auth.updateUser(
      { email: trimmedEmail },
      {
        emailRedirectTo: `${window.location.origin}/confirm-email?oldEmail=${encodeURIComponent(oldEmail)}&action=change_email`,
      }
    );

    if (error) {
      return {
        success: false,
        message: error.message || "Unable to update email",
      };
    }

    return {
      success: true,
      message:
        "Please check your email to confirm the change of your email address.",
      data,
      hasMultipleProviders,
      providers,
    };
  } catch (err) {
    return {
      success: false,
      message: "System error while updating email",
    };
  }
};

// Function để unlink Google provider
export const unlinkProvider = async (type: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Not found user",
      };
    }

    const identity = user.identities?.find(
      (identity) => identity.provider === type
    );

    if (!identity) {
      return {
        success: false,
        message: "Not found Google provider",
      };
    }

    const { error } = await supabase.auth.unlinkIdentity(identity);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Google link unlinked successfully!",
    };
  } catch (err) {
    return {
      success: false,
      message: "System error while unlinking Google",
    };
  }
};

// Function để check xem user có cần unlink không
export const checkNeedUnlink = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { needUnlink: false };

    const providers = user.app_metadata?.providers || [];
    const hasGoogleProvider = providers.includes("google");
    const hasMultipleProviders = providers.length > 1;

    return {
      needUnlink: hasMultipleProviders && hasGoogleProvider,
      providers,
      googleEmail: user.user_metadata?.email,
      currentEmail: user.email,
    };
  } catch (err) {
    return { needUnlink: false };
  }
};

export const checkUserAndUpdateEmail = async (email: string) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "Please login before changing email",
    };
  }

  const result = await updateUserEmail(email);
  return result;
};
