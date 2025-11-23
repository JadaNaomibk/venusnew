// src/pages/AuthPage.jsx
// this page lets someone either log in or create an account.
// it talks directly to my backend auth routes at /api/auth/...

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiRequest } from "../api.js"

function AuthPage() {
  // mode tells me if I'm in "login" or "register" mode
  const [mode, setMode] = useState("login")

  // basic email + password fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // message for success / error feedback
  const [message, setMessage] = useState("")

  // loading flag so I can disable the button while the request runs
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // this runs when the form is submitted
  async function handleSubmit(e) {
    // stop the browser from refreshing the page
    e.preventDefault()

    // clear any old message + show loading
    setMessage("")
    setLoading(true)

    try {
      // choose which backend route I want to call
      // if mode is "login" → POST /api/auth/login
      // if mode is "register" → POST /api/auth/register
      const path = mode === "login" ? "/auth/login" : "/auth/register"

      // send email + password to the backend
      const data = await apiRequest(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      // if the backend sent back a message, show it
      setMessage(data.message || "success.")

      // after a successful auth, send the user to the dashboard
      navigate("/dashboard")
    } catch (err) {
      // if anything goes wrong, show the error message
      setMessage(err.message)
    } finally {
      // no matter what happens, stop the loading state
      setLoading(false)
    }
  }

  return (
    <main className="auth">
      <h1>venus auth</h1>

      {/* toggle buttons so the user can switch between login + sign up */}
      <div className="auth-toggle">
        <button
          type="button"
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          log in
        </button>

        <button
          type="button"
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          sign up
        </button>
      </div>

      {/* main auth form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          email
          <input
            type="email"
            value={email}                 // controlled input (React owns the value)
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} // update state when user types
            required
          />
        </label>

        <label>
          password
          <input
            type="password"
            value={password}
            // small UX touch: autocomplete field changes based on mode
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading
            ? "please wait..."
            : mode === "login"
            ? "log in"
            : "create account"}
        </button>
      </form>

      {/* only show this paragraph if we actually have a message to display */}
      {message && <p className="auth-message">{message}</p>}

      <p className="auth-note">
        this is just a prototype. please don&apos;t use real banking passwords here.
      </p>
    </main>
  )
}

export default AuthPage
