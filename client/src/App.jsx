// src/App.jsx
// Main React app component.
// Routes:
//   "/"          → LandingPage (intro)
//   "/auth"      → AuthPage (login / signup)
//   "/dashboard" → DashboardPage (lockable savings demo)
//   "/insights"  → InsightsPage (savings tips + overview)

import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import NavBar from './components/NavBar.jsx'

function App() {
  return (
    <div className="app">
      <NavBar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </div>
  )
}

export default App
