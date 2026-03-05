import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import "./Header.css";

export default function Header() {
  const { state, dispatch } = useTodo();
  const navigate = useNavigate();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  function handleLogout() {
    dispatch({ type: "CLEAR_USER" });
    navigate("/");
  }

  async function handleNotifClick() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  }

  if (!state.user) return null;

  return (
    <header className="app-header">
      <div className="header-inner container">
        <div className="header-greeting">
          <h2>Daily To-Do</h2>
          <span className="greeting-text">
            Hello, {state.user.firstName} {state.user.lastName}
          </span>
        </div>
        <div className="header-actions">
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
