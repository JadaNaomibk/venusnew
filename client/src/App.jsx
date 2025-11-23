// src/App.jsx
// three pages for now:
// - "/"          → LandingPage (explains the app)
// - "/auth"      → AuthPage (log in / sign up)
// - "/dashboard" → DashboardPage (view + create savings goals)

import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"

function App() {
  return (
    <div className="app">
      <Routes>
        {/* public landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* auth screen */}
        <Route path="/auth" element={<AuthPage />} />

        {/* basic dashboard for logged-in users */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App
