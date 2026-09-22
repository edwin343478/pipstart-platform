"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { verifyUserPassword } from "@/lib/auth/verify-password";
import {
  safeInternalRedirect,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@/lib/auth/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountActionState = {
  fieldErrors?: Record<string, string>;
  message?: string;
  status: "error" | "idle" | "success";
};

const unavailable: AccountActionState = {
  message:
    "Account services are temporarily unavailable. Please try again later.",
  status: "error",
};

export async function registerAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = validateEmail(formData.get("email"));
  const password = validatePassword(formData.get("password"));
  const displayName = validateDisplayName(formData.get("displayName"));
  const confirmation = formData.get("passwordConfirmation");
  const fieldErrors: Record<string, string> = {};
  if (!email.ok) fieldErrors.email = email.message;
  if (!password.ok) fieldErrors.password = password.message;
  if (!displayName.ok) fieldErrors.displayName = displayName.message;
  if (password.ok && confirmation !== password.value) {
    fieldErrors.passwordConfirmation = "Passwords do not match.";
  }
  if (formData.get("terms") !== "accepted") {
    fieldErrors.terms = "You must accept the Terms and Privacy Policy.";
  }
  if (Object.keys(fieldErrors).length > 0)
    return { fieldErrors, status: "error" };

  const supabase = await createSupabaseServerClient();
  if (!supabase || !email.ok || !password.ok || !displayName.ok)
    return unavailable;
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { display_name: displayName.value },
    },
  });
  if (error) {
    console.error("PipStart registration failed", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    return {
      message:
        "We could not create the account. Check your details or try again shortly.",
      status: "error",
    };
  }
  redirect("/welcome");
}

export async function loginAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = validateEmail(formData.get("email"));
  const password =
    typeof formData.get("password") === "string"
      ? String(formData.get("password"))
      : "";
  if (!email.ok || !password) {
    return { message: "Email or password is incorrect.", status: "error" };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password,
  });
  if (error)
    return { message: "Email or password is incorrect.", status: "error" };
  redirect(
    safeInternalRedirect(String(formData.get("next") ?? ""), "/dashboard"),
  );
}

export async function forgotPasswordAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const email = validateEmail(formData.get("email"));
  if (!email.ok)
    return { fieldErrors: { email: email.message }, status: "error" };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) {
    console.error("PipStart password recovery request failed", {
      code: error.code,
      status: error.status,
    });
  }
  return {
    message:
      "If an account matches that email, a password-reset link is on its way.",
    status: "success",
  };
}

export async function resetPasswordAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const password = validatePassword(formData.get("password"));
  if (!password.ok)
    return { fieldErrors: { password: password.message }, status: "error" };
  if (formData.get("passwordConfirmation") !== password.value) {
    return {
      fieldErrors: { passwordConfirmation: "Passwords do not match." },
      status: "error",
    };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.updateUser({
    password: password.value,
  });
  if (error?.code === "same_password") {
    return {
      message:
        "Choose a new password that is different from your current password.",
      status: "error",
    };
  }
  if (error)
    return {
      message: "This recovery link is invalid or has expired.",
      status: "error",
    };
  redirect("/account/security?notice=password-updated");
}

export async function updateProfileAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser("/account/profile");
  const displayName = validateDisplayName(formData.get("displayName"));
  if (!displayName.ok)
    return {
      fieldErrors: { displayName: displayName.message },
      status: "error",
    };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase
    .from("pipstart_profiles")
    .update({ display_name: displayName.value })
    .eq("user_id", user.id)
    .select("user_id")
    .single();
  if (error)
    return { message: "Your profile could not be updated.", status: "error" };
  revalidatePath("/account/profile");
  return { message: "Profile updated.", status: "success" };
}

export async function updateEmailPreferencesAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser("/account/email-preferences");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase
    .from("pipstart_email_preferences")
    .update({
      educational_emails: formData.get("educationalEmails") === "on",
      marketing_emails: formData.get("marketingEmails") === "on",
    })
    .eq("user_id", user.id)
    .select("user_id")
    .single();
  if (error)
    return {
      message: "Your email preferences could not be updated.",
      status: "error",
    };
  revalidatePath("/account/email-preferences");
  return { message: "Email preferences updated.", status: "success" };
}

export async function changePasswordAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser("/account/security");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = validatePassword(formData.get("password"));
  if (!currentPassword || !password.ok) {
    return {
      fieldErrors: {
        ...(!currentPassword
          ? { currentPassword: "Enter your current password." }
          : {}),
        ...(!password.ok ? { password: password.message } : {}),
      },
      status: "error",
    };
  }
  if (formData.get("passwordConfirmation") !== password.value) {
    return {
      fieldErrors: { passwordConfirmation: "Passwords do not match." },
      status: "error",
    };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase || !user.email) return unavailable;
  const verified = await verifyUserPassword(user.email, currentPassword);
  if (verified === null) return unavailable;
  if (!verified)
    return {
      fieldErrors: { currentPassword: "Current password is incorrect." },
      status: "error",
    };
  const { error } = await supabase.auth.updateUser({
    password: password.value,
  });
  if (error)
    return { message: "Your password could not be updated.", status: "error" };
  return { message: "Password updated.", status: "success" };
}

export async function logoutAction(formData: FormData): Promise<void> {
  const scopeValue = formData.get("scope");
  const scope =
    scopeValue === "global" || scopeValue === "others" ? scopeValue : "local";
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut({ scope });
  redirect(
    scope === "others"
      ? "/account/security?notice=other-sessions-ended"
      : "/login?notice=signed-out",
  );
}

export async function deleteAccountAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await requireUser("/account/delete");
  if (formData.get("confirmation") !== "DELETE") {
    return {
      fieldErrors: { confirmation: "Type DELETE exactly to confirm." },
      status: "error",
    };
  }
  const password = String(formData.get("password") ?? "");
  if (!password)
    return {
      fieldErrors: { password: "Enter your password." },
      status: "error",
    };
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin || !user.email) return unavailable;
  const verified = await verifyUserPassword(user.email, password);
  if (verified === null) return unavailable;
  if (!verified)
    return {
      fieldErrors: { password: "Password is incorrect." },
      status: "error",
    };
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error)
    return {
      message: "Your account could not be deleted. Please try again.",
      status: "error",
    };
  await supabase.auth.signOut({ scope: "global" });
  redirect("/account-deleted");
}
