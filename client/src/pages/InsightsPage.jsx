// src/pages/InsightsPage.jsx
// Lightweight "insights" page that pulls in a live savings tip
// from an external API and gives the app a 4th route.

import SavingsTipPanel from '../components/SavingsTipPanel.jsx'

function InsightsPage() {
  return (
    <main className="insights">
      <h1>venus insights</h1>
      <p className="subtitle">
        quick ideas to keep you on track with your savings goals.
      </p>

      <section className="card insights-body">
        <h2>today&apos;s savings tip</h2>
        <SavingsTipPanel />

        <div className="insights-text">
          <p>
            Venus is meant to feel like a real savings app: you set goals,
            choose targets, and track what actually happens when temptation
            shows up.
          </p>
          <p>
            Use the dashboard to experiment with different goals, dates, and
            amounts. Notice how often you tap the emergency button, and what
            kinds of penalties would keep you honest in real life.
          </p>
        </div>
      </section>
    </main>
  )
}

export default InsightsPage
