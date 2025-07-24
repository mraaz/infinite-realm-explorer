
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { branding } from "@/config/branding";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    console.log("[AuthCallback] Component mounted");
    console.log("[AuthCallback] Current URL:", window.location.href);
    console.log("[AuthCallback] Search params:", location.search);

    const handleAuthCallback = async () => {
      // Get the token from the URL query parameter.
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      console.log("[AuthCallback] Token received:", !!token);
      console.log("[AuthCallback] Error received:", error);

      // Find out where the user was before they logged in.
      const preLoginPath = localStorage.getItem("preLoginPath") || "/"; // Default to the homepage if not found.
      console.log("[AuthCallback] PreLoginPath:", preLoginPath);

      if (token) {
        try {
          console.log("[AuthCallback] Processing login with token");
          // Use the auth context to handle login (this updates global state)
          await login(token);

          // Clean up the stored path from localStorage.
          localStorage.removeItem("preLoginPath");

          // Send the user back to where they came from.
          console.log("[AuthCallback] Redirecting to:", preLoginPath);
          navigate(preLoginPath, { replace: true });
        } catch (loginError) {
          console.error("[AuthCallback] Login failed:", loginError);
          navigate("/?error=login_failed", { replace: true });
        }
      } else if (error) {
        console.error("[AuthCallback] OAuth error:", error);
        navigate("/?error=" + encodeURIComponent(error), { replace: true });
      } else {
        console.error("[AuthCallback] No token or error found in callback");
        // If login failed for some reason, send them to a login error page or the homepage.
        navigate("/?error=no_token", { replace: true });
      }
    };

    handleAuthCallback();
  }, [location, navigate, login]);

  // Display a simple loading message while the redirect logic runs.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <img
            src={branding.logo.url}
            alt={branding.logo.alt}
            className="h-8 w-8"
          />
          <span className="text-2xl font-semibold text-gray-900">
            {branding.name}
          </span>
        </div>
        <p className="text-gray-600">
          Please wait while we complete your login...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
