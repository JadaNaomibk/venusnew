// src/App.jsx
// two pages: landing + auth. keeping it simple on purpose.

import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'

  function App() {
  return (
    <div className="app">
      <div className="demo-banner">
        this is a capstone demo. do not use real banking info or passwords.
      </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}


export default App
