// src/App.jsx
// main app routes for Venus.
//
// - "/"        → landing page
// - "/auth"    → login / sign up
// - "/dashboard" → savings dashboard

import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
