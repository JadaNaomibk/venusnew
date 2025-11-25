// src/pages/LandingPage.jsx
// public marketing / landing page for Venus

import { useNavigate } from "react-router-dom";

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
          venus is a focused savings workspace for people who are tired of
          watching their “rent money” turn into “oops, i ordered food again.”
        </p>

        <p>
          you choose a goal, set an amount, lock it until a date, and practice
          leaving it alone. every goal has a name, a lock date, and a status,
          so you can see exactly where your money is supposed to be going.
        </p>

        <p>
          venus is designed for small, intentional amounts you can commit to
          right now – flights, security deposits, emergency buffers, passion
          projects, whatever you&apos;re building toward.
        </p>

        <div className="cta-buttons">
          <button onClick={() => navigate("/auth")}>
            open your venus workspace
          </button>
        </div>

        <p className="landing-footnote">
          current version runs in a private practice environment on your
          device. balances and goals here are examples you control – no
          external bank accounts are connected.
        </p>
      </section>
    </main>
  );
}

export default LandingPage;
