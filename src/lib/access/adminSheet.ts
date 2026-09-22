export const ADMIN_PASSWORD_UNSET_CODE = "admin_password_unset";
export const ADMIN_LOGIN_REQUIRED_CODE = "admin_login_required";
export const DATABASE_UNAVAILABLE_CODE = "database_unavailable";

export const ADMIN_PASSWORD_UNSET_MESSAGE =
  "Password login is not set up on this server. Close this screen — you are not stuck.";

export const DATABASE_UNAVAILABLE_MESSAGE =
  "The access list needs the live database. Close this screen and try again after it is connected.";

export type AdminSheetView = "loading" | "list" | "password" | "blocked";

/** Unset password / missing DB → blocked (dismissible), never a stuck form. */
export function adminSheetView(input: {
  canOpen: boolean;
  authed: boolean;
  loading: boolean;
  code?: string | null;
}): AdminSheetView {
  if (input.authed) return "list";
  if (!input.canOpen) return "blocked";
  if (input.loading) return "loading";
  if (input.code === ADMIN_LOGIN_REQUIRED_CODE || !input.code) {
    return "password";
  }
  return "blocked";
}

export function adminSheetBlockedMessage(code?: string | null): string {
  if (code === DATABASE_UNAVAILABLE_CODE) return DATABASE_UNAVAILABLE_MESSAGE;
  if (code === ADMIN_PASSWORD_UNSET_CODE) return ADMIN_PASSWORD_UNSET_MESSAGE;
  return "Sign in with an admin number under Access first.";
}
