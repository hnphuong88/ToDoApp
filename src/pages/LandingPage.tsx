import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import "./LandingPage.css";

export default function LandingPage() {
  const { state, dispatch } = useTodo();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});

  if (state.user) {
    return <Navigate to="/dashboard" replace />;
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    dispatch({
      type: "SET_USER",
      payload: { firstName: firstName.trim(), lastName: lastName.trim() },
    });
    navigate("/dashboard");
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <h1 className="landing-title">Daily To-Do</h1>
        <p className="landing-tagline">
          Organize your day, one task at a time.
        </p>
        <form className="landing-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && (
              <span className="field-error">{errors.firstName}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && (
              <span className="field-error">{errors.lastName}</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary landing-btn">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
