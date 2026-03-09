import { useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useEffect } from "react";
import { loginRequest } from "../auth/msalConfig";
import "./LandingPage.css";

export default function LandingPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin() {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <h1 className="landing-title">Daily To-Do</h1>
        <p className="landing-tagline">
          Organize your day, one task at a time.
        </p>
        <p className="landing-subtitle">
          Sign in with your account to get started.
        </p>
        <button
          type="button"
          className="btn btn-primary landing-btn"
          onClick={handleLogin}
        >
          Sign In / Sign Up
        </button>
      </div>
    </div>
  );
}
