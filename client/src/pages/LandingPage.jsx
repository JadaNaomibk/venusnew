// src/pages/LandingPage.jsx
// Landing page that explains the idea
// and sends people to the auth screen.

import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing">
      <header className="landing-header">
        <h1>VENUS SAVINGS</h1>
        <p className="tagline">lock it. forget it. reach it.</p>
      </header>

      <section className="landing-body card">
        <p>
          Venus is a lockable savings trainer built for people who are tired of
          “accidentally” spending the money that was supposed to be for rent,
          trips, or emergencies.
        </p>

        <p>
          You pick a goal, choose a target amount, lock it until a date, and
          track your behavior — including emergency withdrawals and simulated
          penalties when you break your own rules.
        </p>

        <p>
          This version is a **practice app**. There are no real bank
          connections or real money transfers; it&apos;s just here to help you
          build the habit and visualize your progress.
        </p>

        <div className="cta-buttons">
          <button onClick={() => navigate('/auth')}>
            start a savings profile
          </button>
        </div>

        <p className="landing-footnote">
          Later, this flow can grow into a full fintech app with real deposits,
          community investment, and ethical savings habits baked in.
        </p>
      </section>
    </main>
  )
}

export default LandingPage
