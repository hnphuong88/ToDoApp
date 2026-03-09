import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useTodo } from "../context/TodoContext";
import "./Header.css";

export default function Header() {
  const { state } = useTodo();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const onDashboard = location.pathname === "/dashboard";
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  function handleLogout() {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  }

  async function handleNotifClick() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  }

  const displayName = state.user?.displayName ?? "User";

  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="header-greeting">
          <h2
            className="header-title-link"
            onClick={() => navigate("/dashboard")}
            role="button"
            tabIndex={0}
          >
            Daily To-Do
          </h2>
          <span className="greeting-text">Hello, {displayName}</span>
        </div>
        <div className="header-actions">
          {onDashboard ? (
            <button
              className="btn btn-secondary header-nav-btn"
              onClick={() => navigate("/teams")}
            >
              Teams
            </button>
          ) : (
            <button
              className="btn btn-secondary header-nav-btn"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          )}
          <button
            className={`notif-bell ${notifPermission === "granted" ? "enabled" : ""}`}
            onClick={handleNotifClick}
            title={
              notifPermission === "granted"
                ? "Notifications enabled"
                : notifPermission === "denied"
                  ? "Notifications blocked"
                  : "Click to enable notifications"
            }
            aria-label="Toggle notifications"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifPermission === "granted" && <span className="notif-dot" />}
          </button>
          <button className="btn btn-secondary header-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
