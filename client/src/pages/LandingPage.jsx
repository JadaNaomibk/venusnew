// src/pages/LandingPage.jsx
// simple landing page that explains the idea
// and sends people to the auth screen.

import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing">
      <header className="landing-header">
        <h1>VENUS SAVINGS</h1>
        <p className="tagline">lock it. forget it. reach it.</p>
      </header>

      <section className="landing-body card">
        <p>
          venus is a lockable savings demo built to help people like us stop
          &quot;accidentally&quot; spending the money that was supposed to be for
          rent, flights, or emergencies. you choose a goal, lock a number, and
          practice leaving it alone.
        </p>

        <p>
          this version uses mock data only — no real bank connections — so you
          can play with the idea safely before it ever touches real money.
        </p>

        <div className="cta-buttons">
          <button onClick={() => navigate('/auth')}>
            start a mock savings goal
          </button>
        </div>

        <p className="landing-footnote">
          later, this flow can grow into a full fintech app with real deposits,
          community investment, and ethical savings habits baked in.
        </p>
      </section>
    </main>
  );
}

export default LandingPage;