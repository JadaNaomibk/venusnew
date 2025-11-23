// src/pages/LandingPage.jsx
// super simple landing page for Venus.
// goal: explain the idea in 1-2 lines and send user to auth.

import { useNavigate } from "react-router-dom"

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing">
      <header className="landing-header">
        <h1>VENUS SAVINGS</h1>
        <p className="tagline">lock it on purpose. reach it on purpose.</p>
      </header>

      <section className="landing-body">
        <p>
          venus is my lockable savings demo. you choose an amount, set a lock date,
          and (in the full version) the app keeps you accountable. right now I&apos;m
          showing the core auth + savings flow for my capstone.
        </p>

        <div className="cta-buttons">
          <button onClick={() => navigate("/auth")}>get started</button>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
