/**
 * avatarUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central helper for resolving profile picture URLs.
 *
 * Handling priority:
 *  1. Empty, null, undefined, or "/default-avatar.png" -> SVG fallback avatar
 *  2. Full Cloudinary / external HTTPS URL -> return as-is
 *  3. Legacy "/uploads/..." relative path -> prepend API_URL
 */

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "https://swavio-backend.onrender.com";

/**
 * Inline SVG data-URL fallback used when an image is absent or fails to load.
 */
export const FALLBACK_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' rx='40' fill='%23e5e7eb'/%3E%3Cellipse cx='40' cy='32' rx='13' ry='13' fill='%239ca3af'/%3E%3Cellipse cx='40' cy='70' rx='22' ry='17' fill='%239ca3af'/%3E%3C/svg%3E`;

/**
 * Resolved URL safe to drop straight into an <img src>
 */
export function getAvatarUrl(rawPath) {
  if (!rawPath || rawPath === "/default-avatar.png") return FALLBACK_AVATAR;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
  if (rawPath.startsWith("/uploads")) return `${API_URL}${rawPath}`;
  return rawPath;
}

/**
 * Drop-in onError handler for <img> elements.
 * Replaces broken images with the SVG fallback without causing infinite loops.
 */
export function handleAvatarError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_AVATAR;
}
