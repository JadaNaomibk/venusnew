// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom"

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing">
      <header className="landing-header">
        <h1>VENUS </h1>
        <p className="tagline">
          Venus is a lockable savings app. We locked up your money and THREW AWAY THE KEY.
        </p>
      </header>

      <section className="landing-body">
        <p>
          venus lets you pick a goal, choose an amount, and lock that money
          until a date you choose. you either wait until it
          unlocks or use one emergency pull with penalty.
        </p>
        <p>
          this capstone version is a prototype. it shows the logic behind
          lockable savings and how an ethical bank could build on it. 
          Venus is named after the VENUS WILLIAMS.
          This app will grow in time as I push to deploy , and release this.
          It us an original idea that was inspired after the death of the insurance ceo.
          I thought to myself how can my generation have transparent and ethical business practices and i came up wit VENUS.
          Transparent banking and investments from someone like you !
        </p>

        <div className="cta-buttons">
          <button type="button" onClick={() => navigate("/auth")}>
            get started
          </button>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
