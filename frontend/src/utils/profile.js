import { apiBaseURL } from "../api/api";

/** Resolve profile image fields consistently for every account surface. */
export function getProfileImageUrl(user) {
  const value =
    user?.profilePhotoUrl ||
    user?.profilePhoto ||
    user?.avatar ||
    user?.profileImage ||
    "";

  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const origin = apiBaseURL.replace(/\/api\/?$/i, "");
  return origin + (value.startsWith("/") ? value : "/" + value);
}

/** Use the first and last name initials (not the first two characters). */
export function getProfileInitials(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] || "" : "";
  return (first + last).toUpperCase();
}
