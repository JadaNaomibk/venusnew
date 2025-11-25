// client/src/pages/LandingPage.jsx
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
          venus is a lockable savings app designed to stop “accidental” spending
          of money that was supposed to be for rent, flights, or emergencies.
          you choose a goal, lock an amount, and practice leaving it alone.
        </p>

        <p>
          this prototype uses a secure login and a real database behind the
          scenes – but no real bank accounts – so you can safely test your
          saving habits.
        </p>

        <div className="cta-buttons">
          <button onClick={() => navigate('/auth')}>
            start a savings goal
          </button>
        </div>

        <p className="landing-footnote">
          later, this flow can grow into a full fintech product with real
          deposits, community investment, and ethical savings baked in.
        </p>
      </section>
    </main>
  );
}

export default LandingPage;
