import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2 } from "lucide-react";

export default function GoogleAuthButton({ text = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState(process.env.REACT_APP_GOOGLE_CLIENT_ID || "");
  const navigate = useNavigate();

  // If clientId was not baked in at frontend build time, fetch it dynamically from backend
  useEffect(() => {
    if (!clientId) {
      api
        .get("/api/auth/google-client-id")
        .then((res) => {
          if (res.data?.clientId) {
            setClientId(res.data.clientId);
            setError("");
          }
        })
        .catch(() => {});
    }
  }, [clientId]);

  const handleGoogleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) return;
      setLoading(true);
      setError("");

      try {
        const res = await api.post("/api/auth/google", {
          credential: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("fullName", res.data.user.fullName || "");
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
      } catch (err) {
        console.error("Google login failed:", err.message);
        setError(err.response?.data?.msg || "Google authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!clientId) return;

    function initializeGoogleGsi() {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      } catch (err) {
        console.warn("Failed to initialize Google GSI:", err.message);
      }
    }

    const scriptId = "google-jssdk";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleGsi;
      document.body.appendChild(script);
    } else {
      initializeGoogleGsi();
    }
  }, [clientId, handleGoogleCredentialResponse]);

  const handleGoogleClick = () => {
    if (!clientId) {
      setError("Google OAuth Client ID is not configured (REACT_APP_GOOGLE_CLIENT_ID).");
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is skipped/suppressed, show standard OAuth popup redirect
          const redirectUri = window.location.origin;
          const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
            clientId
          )}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
            redirectUri
          )}`;
          window.location.href = oauthUrl;
        }
      });
    } else {
      setError("Google Identity service is loading. Please try again in a moment.");
    }
  };

  return (
    <div className="w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 dark:text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-brand-500" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{text}</span>
      </button>

      {error && (
        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}

