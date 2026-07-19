/**
 * avatarUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central helper for resolving profile picture URLs.
 *
 * The backend stores paths as "/uploads/filename.ext" (relative).
 * In production the frontend (Vercel) and backend (Render) are on different
 * origins, so we must prepend REACT_APP_API_URL before any relative path.
 *
 * Usage:
 *   import { getAvatarUrl, FALLBACK_AVATAR } from "../utils/avatarUrl";
 *   <img src={getAvatarUrl(user?.profilePicture)} onError={handleAvatarError} />
 */

const API_URL = process.env.REACT_APP_API_URL || "";

/** Resolved URL safe to drop straight into an <img src> */
export function getAvatarUrl(rawPath) {
  if (!rawPath) return FALLBACK_AVATAR;
  // Already a full URL (Google OAuth photo, Gravatar, etc.)
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
  // Relative path saved by multer: "/uploads/..."
  if (rawPath.startsWith("/uploads")) return `${API_URL}${rawPath}`;
  // Anything else pass through
  return rawPath;
}

/**
 * Inline SVG data-URL used as the fallback src when an image 404s.
 * Renders a neutral grey avatar silhouette — never a broken-image icon.
 */
export const FALLBACK_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' rx='40' fill='%23e5e7eb'/%3E%3Cellipse cx='40' cy='32' rx='13' ry='13' fill='%239ca3af'/%3E%3Cellipse cx='40' cy='70' rx='22' ry='17' fill='%239ca3af'/%3E%3C/svg%3E`;

/**
 * Drop-in onError handler for <img> elements.
 * Replaces the broken image with the SVG fallback.
 *
 *  <img src={getAvatarUrl(user.profilePicture)} onError={handleAvatarError} />
 */
export function handleAvatarError(e) {
  e.currentTarget.onerror = null; // prevent infinite loop
  e.currentTarget.src = FALLBACK_AVATAR;
}
