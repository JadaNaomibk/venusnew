// src/pages/DashboardPage.jsx
// dashboard page for Venus.
// this version still uses ONLY FRONTEND STATE (localStorage)
// for savings goals – no real money, no real bank connections.

import { useState, useEffect } from "react";
// you can wire this in later if you want to use it
// import { CheckUploadBox } from "../components/CheckUploadBox.jsx";

function DashboardPage() {
  // -----------------------------
  // 1. state for the savings form
  // -----------------------------
  const [label, setLabel] = useState("");          // goal name (ex: "Puerto Rico trip")
  const [amount, setAmount] = useState("");        // how much to lock right now
  const [targetAmount, setTargetAmount] = useState(""); // total goal (ex: 5000)
  const [lockUntil, setLockUntil] = useState("");  // date string like "2025-12-31"
  const [emergencyAllowed, setEmergencyAllowed] = useState(true);

  // -----------------------------
  // 2. state for the goals list
  // -----------------------------
  const [goals, setGoals] = useState([]);          // array of goal objects
  const [message, setMessage] = useState("");      // success / warning text for the user

  // how many emergency withdraws the user has done (across all goals)
  const [withdrawEvents, setWithdrawEvents] = useState(0);

  // -------------------------------------------
  // 3. load any saved goals + withdraw count
  //    from localStorage on first render
  // -------------------------------------------
  useEffect(() => {
    try {
      const storedGoals = localStorage.getItem("venusGoals");
      if (storedGoals) {
        const parsed = JSON.parse(storedGoals);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch (err) {
      console.error("error reading venusGoals from localStorage:", err);
    }

    try {
      const storedCount = localStorage.getItem("venusWithdrawEvents");
      if (storedCount != null) {
        const parsedCount = Number(storedCount);
        if (!Number.isNaN(parsedCount)) {
          setWithdrawEvents(parsedCount);
        }
      }
    } catch (err) {
      console.error("error reading withdrawEvents from localStorage:", err);
    }
  }, []);

  // ----------------------------------------------------
  // 4. whenever "goals" changes, save them to storage
  // ----------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem("venusGoals", JSON.stringify(goals));
    } catch (err) {
      console.error("error saving venusGoals to localStorage:", err);
    }
  }, [goals]);

  // ----------------------------------------------------
  // 5. whenever withdrawEvents changes, save that too
  // ----------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem("venusWithdrawEvents", String(withdrawEvents));
    } catch (err) {
      console.error("error saving withdrawEvents to localStorage:", err);
    }
  }, [withdrawEvents]);

  // ------------------------------------------------
  // helper: build one goal object in a consistent way
  // ------------------------------------------------
  function createGoalObject({ label, amount, targetAmount, lockUntil, emergencyAllowed }) {
    const now = new Date();

    const numericAmount = Number(amount);
    // if no explicit target is given, treat the current amount as the target
    const numericTarget = targetAmount
      ? Number(targetAmount)
      : numericAmount;

    return {
      id: String(now.getTime()) + "-" + Math.random().toString(16).slice(2),
      label: String(label).trim(),
      amount: numericAmount,          // how much is currently locked
      targetAmount: numericTarget,    // full goal amount ("I want to reach 5000")
      lockUntil,                      // date string from the input
      createdAt: now.toISOString(),
      status: "locked",               // "locked" or "withdrawn"
      emergencyAllowed: !!emergencyAllowed,
      emergencyUsed: false,           // becomes true if this goal was withdrawn
    };
  }

  // ------------------------------------------------
  // submit handler for the "create goal" form
  // ------------------------------------------------
  function handleCreateGoal(event) {
    event.preventDefault();
    setMessage("");

    // simple validation
    if (!label || !amount || !lockUntil) {
      setMessage("please fill out all the fields first.");
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("amount must be a positive number.");
      return;
    }

    let numericTarget = numericAmount;
    if (targetAmount) {
      numericTarget = Number(targetAmount);
      if (Number.isNaN(numericTarget) || numericTarget <= 0) {
        setMessage("target amount must be a positive number.");
        return;
      }
    }

    const newGoal = createGoalObject({
      label,
      amount: numericAmount,
      targetAmount: numericTarget,
      lockUntil,
      emergencyAllowed,
    });

    // prepend new goal
    setGoals((prev) => [newGoal, ...prev]);

    // clear the form
    setLabel("");
    setAmount("");
    setTargetAmount("");
    setLockUntil("");
    setEmergencyAllowed(true);

    setMessage("new savings goal locked.");
  }

  // ------------------------------------------------
  // click handler for "emergency withdraw" button
  // global limit: if you use emergency withdraw too many times,
  // you start getting blocked + warned (penalty vibe).
  // ------------------------------------------------
  function handleEmergencyWithdraw(goalId) {
    setMessage("");

    // hard limit: after 3 emergency withdraws, we block more
    if (withdrawEvents >= 3) {
      setMessage(
        "you've reached the emergency withdraw limit. in a real app, more early unlocks would trigger penalty fees."
      );
      return;
    }

    let didWithdraw = false;

    setGoals((prevGoals) =>
      prevGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        // already withdrawn? don't double-count
        if (goal.status === "withdrawn") {
          return goal;
        }

        didWithdraw = true;

        return {
          ...goal,
          status: "withdrawn",
          emergencyUsed: true,
        };
      })
    );

    // only update the counter if we actually changed a goal
    if (didWithdraw) {
      setWithdrawEvents((prevCount) => {
        const newCount = prevCount + 1;

        if (newCount > 2) {
          setMessage(
            "warning: you've used emergency withdraw multiple times. in a real app, future unlocks would incur a penalty percentage."
          );
        } else {
          setMessage("goal withdrawn from lock.");
        }

        return newCount;
      });
    }
  }

  // ------------------------------------------------
  // helper: compute total locked amount (only locked goals)
  // ------------------------------------------------
  const totalLocked = goals
    .filter((goal) => goal.status === "locked")
    .reduce((sum, goal) => sum + (Number(goal.amount) || 0), 0);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p
          style={{
            textAlign: "center",
            marginTop: "0.5rem",
            color: "var(--text-muted)",
          }}
        >
          logged in
        </p>

        <h1>your venus dashboard</h1>

        <button
          onClick={() => {
            // clear local demo data on logout
            localStorage.removeItem("venusGoals");
            localStorage.removeItem("venusWithdrawEvents");

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
          logout
        </button>

        <p className="dashboard-subtitle">
          lock small amounts on purpose, not by accident.
        </p>
      </header>

      {/* summary cards at the top */}
      <section className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">goals locked</span>
          <span className="summary-value">{goals.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">total locked</span>
          <span className="summary-value">${totalLocked.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">emergency withdraws</span>
          <span className="summary-value">{withdrawEvents}</span>
        </div>
      </section>

      {withdrawEvents >= 2 && (
        <p className="dashboard-warning">
          you&apos;ve used emergency withdraw more than once. in a real app,
          future early unlocks would be limited or charged a fee to protect your savings.
        </p>
      )}

      <section className="dashboard-grid">
        {/* form column */}
        <section className="dashboard-section">
          <h2>create a savings goal</h2>

          <form className="goal-form" onSubmit={handleCreateGoal}>
            <label>
              goal name
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ex: flight, rent buffer, camera"
                required
              />
            </label>

            <label>
              amount to lock now
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
              target amount (total goal)
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                min="1"
                step="0.01"
                placeholder="ex: 5000"
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

        {/* goals list column */}
        <section className="dashboard-section">
          <h2>your savings goals</h2>

          {goals.length === 0 && (
            <p className="empty-state">
              you don&apos;t have any locked goals yet. start with something tiny.
            </p>
          )}

          <ul className="goals-list">
            {goals.map((goal) => {
              const target = Number(goal.targetAmount) || Number(goal.amount) || 0;
              const current = Number(goal.amount) || 0;
              const progress =
                target > 0
                  ? Math.min(100, Math.round((current / target) * 100))
                  : 0;

              return (
                <li key={goal.id} className="goal-card">
                  <div className="goal-card-main">
                    <h3>{goal.label}</h3>
                    <p className="goal-amount">${current.toFixed(2)} locked</p>
                    {target > 0 && (
                      <p className="goal-meta">
                        goal: ${target.toFixed(2)} &nbsp; • &nbsp; lock until:{" "}
                        {goal.lockUntil}
                      </p>
                    )}

                    {/* progress bar + text like "$25 out of $5000 saved (0.5%)" */}
                    <div className="goal-progress">
                      <div className="goal-progress-bar">
                        <div
                          className="goal-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {target > 0 && (
                        <p className="goal-progress-text">
                          ${current.toFixed(2)} out of ${target.toFixed(2)} saved (
                          {progress}%)
                        </p>
                      )}
                    </div>
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
                        {goal.emergencyUsed ? "emergency used" : "emergency allowed"}
                      </span>
                    )}

                    {goal.status === "locked" && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEmergencyWithdraw(goal.id)}
                        disabled={withdrawEvents >= 3}
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
    </main>
  );
}

export default DashboardPage;
