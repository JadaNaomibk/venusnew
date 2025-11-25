// src/pages/DashboardPage.jsx
// main logged-in dashboard for Venus lockable savings.
// data is stored locally in the browser to simulate real goals.

import { useState, useEffect } from "react";

function DashboardPage() {
  // 1. form state
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [lockUntil, setLockUntil] = useState("");
  const [emergencyAllowed, setEmergencyAllowed] = useState(true);

  // 2. goals + ui feedback
  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState("");

  // 3. load any stored goals from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("venusGoals");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch (err) {
      console.error("error reading venusGoals from localStorage:", err);
    }
  }, []);

  // 4. persist goals whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("venusGoals", JSON.stringify(goals));
    } catch (err) {
      console.error("error saving venusGoals to localStorage:", err);
    }
  }, [goals]);

  function createGoalObject({ label, amount, lockUntil, emergencyAllowed }) {
    const now = new Date();

    return {
      id: String(now.getTime()) + "-" + Math.random().toString(16).slice(2),
      label: String(label).trim(),
      amount: Number(amount),
      lockUntil,
      createdAt: now.toISOString(),
      status: "locked", // "locked" or "withdrawn"
      emergencyAllowed: !!emergencyAllowed,
      emergencyUsed: false,
    };
  }

  function handleCreateGoal(event) {
    event.preventDefault();
    setMessage("");

    if (!label || !amount || !lockUntil) {
      setMessage("please complete all fields before locking a goal.");
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("amount must be a positive number.");
      return;
    }

    const newGoal = createGoalObject({
      label,
      amount: numericAmount,
      lockUntil,
      emergencyAllowed,
    });

    setGoals((prev) => [newGoal, ...prev]);

    setLabel("");
    setAmount("");
    setLockUntil("");
    setEmergencyAllowed(true);

    setMessage("new savings goal locked.");
  }

  function handleEmergencyWithdraw(goalId) {
    setMessage("");

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        if (goal.status === "withdrawn") return goal;

        return {
          ...goal,
          status: "withdrawn",
          emergencyUsed: true,
        };
      })
    );

    setMessage("goal marked as withdrawn.");
  }

  // tiny helper: how many days remain until lock date
  function getDaysRemaining(lockUntil) {
    if (!lockUntil) return null;
    const today = new Date();
    const lockDate = new Date(lockUntil + "T00:00:00");
    const diffMs = lockDate - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const totalLocked = goals
    .filter((goal) => goal.status === "locked")
    .reduce((sum, goal) => sum + goal.amount, 0);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p
          style={{
            textAlign: "center",
            marginTop: "0.5rem",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
          }}
        >
          signed in · personal savings workspace
        </p>

        <h1>your venus dashboard</h1>
        <p className="dashboard-subtitle">
          see every goal in one place, on purpose – not by accident.
        </p>

        <button
          onClick={() => {
            localStorage.removeItem("venusGoals");
            fetch("http://localhost:5001/api/auth/logout", {
              method: "POST",
              credentials: "include",
            }).finally(() => {
              window.location.href = "/auth";
            });
          }}
          className="secondary-button"
          style={{ marginTop: "1rem" }}
        >
          sign out
        </button>
      </header>

      {/* summary row */}
      <section className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">active goals</span>
          <span className="summary-value">{goals.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">total locked</span>
          <span className="summary-value">${totalLocked.toFixed(2)}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        {/* left: create goal */}
        <section className="dashboard-section">
          <h2>create a savings goal</h2>

          <form className="goal-form" onSubmit={handleCreateGoal}>
            <label>
              goal name
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ex: puerto rico flight, rent buffer, camera"
                required
              />
            </label>

            <label>
              amount to lock
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                required
              />
            </label>

            <label>
              lock until
              <input
                type="date"
                value={lockUntil}
                onChange={(e) => setLockUntil(e.target.value)}
                required
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={emergencyAllowed}
                onChange={(e) => setEmergencyAllowed(e.target.checked)}
              />
              allow emergency withdrawal before the lock date
            </label>

            <button type="submit">lock this money</button>
          </form>
        </section>

        {/* right: goals list */}
        <section className="dashboard-section">
          <h2>your savings goals</h2>

          {goals.length === 0 && (
            <p className="empty-state">
              no goals yet. start small – pick one thing you care about, lock a
              number, and practice not touching it.
            </p>
          )}

          <ul className="goals-list">
            {goals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.lockUntil);

              return (
                <li key={goal.id} className="goal-card">
                  <div className="goal-card-main">
                    <h3>{goal.label}</h3>
                    <p className="goal-amount">
                      ${goal.amount.toFixed(2)}
                    </p>
                    <p className="goal-meta">
                      lock until: {goal.lockUntil}
                      {Number.isFinite(daysRemaining) && (
                        <>
                          {" "}
                          ·{" "}
                          {daysRemaining > 0
                            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                            : "lock date reached"}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="goal-status-block">
                    <span
                      className={
                        "status-pill " +
                        (goal.status === "locked" ? "locked" : "withdrawn")
                      }
                    >
                      {goal.status}
                    </span>

                    {goal.emergencyAllowed && (
                      <span className="status-pill emergency">
                        {goal.emergencyUsed
                          ? "emergency used"
                          : "emergency allowed"}
                      </span>
                    )}

                    {goal.status === "locked" && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEmergencyWithdraw(goal.id)}
                      >
                        emergency withdraw
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </section>

      {message && <p className="dashboard-message">{message}</p>}

      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        venus currently runs locally in your browser as a savings practice
        space. numbers shown here are for your planning and tracking.
      </p>
    </main>
  );
}

export default DashboardPage;
