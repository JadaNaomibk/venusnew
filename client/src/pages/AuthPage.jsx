// src/pages/AuthPage.jsx
// sign in / sign up screen for Venus auth

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";

function AuthPage() {
  // which mode is active: "login" or "register"
  const [mode, setMode] = useState("login");

  // basic credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // optional deposit onboarding hint
  const [depositMethod, setDepositMethod] = useState("");

  // ui feedback
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";

      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setMessage(data.message || "signed in.");

      // after auth, send them to dashboard
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const titleText =
    mode === "login"
      ? "sign in to your venus savings"
      : "create your venus savings account";

  const buttonText = mode === "login" ? "sign in" : "create account";

  return (
    <main className="auth">
      <h1>venus</h1>
      <p className="subtitle">{titleText}</p>

      <div className="auth-toggle">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          sign in
        </button>
        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          sign up
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          password
          <input
            type="password"
            value={password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          preferred funding method
          <select
            value={depositMethod}
            onChange={(e) => setDepositMethod(e.target.value)}
          >
            <option value="">select one</option>
            <option value="bank">bank transfer</option>
            <option value="paycheck">paycheck split</option>
            <option value="cash-deposit">cash deposit</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "processing..." : buttonText}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      <p className="auth-note">
        venus is currently running in a private sandbox. use a unique password
        that you do not use for your real bank or email.
      </p>
    </main>
  );
}

export default AuthPage;
