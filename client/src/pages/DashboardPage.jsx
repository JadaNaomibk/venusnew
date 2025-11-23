// src/pages/DashboardPage.jsx
// this page shows the user's savings goals
// and lets them create a new locked goal.
//
// it uses the same apiRequest helper to talk to the backend.

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiRequest } from "../api.js"

function DashboardPage() {
  // list of goals coming from the backend
  const [goals, setGoals] = useState([])

  // form fields for creating a goal
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [lockUntil, setLockUntil] = useState("")

  // whether user allows emergency withdrawal
  const [emergencyAllowed, setEmergencyAllowed] = useState(true)

  // general message area for errors / success
  const [message, setMessage] = useState("")

  // loading flag for the "create goal" button
  const [loading, setLoading] = useState(false)

    // helper to compute how much money is still locked
  const totalLockedAmount = goals
    .filter((goal) => goal.status === "locked")
    .reduce((sum, goal) => sum + Number(goal.amount || 0), 0)


  const navigate = useNavigate()

  // this runs once when the page first loads
  useEffect(() => {
    loadGoals()
    // I only want this to run on mount,
    // so I'm leaving the dependency array empty.
  }, [])

  // helper to fetch goals from backend
   async function loadGoals() {
    try {
      setMessage("")
      const data = await apiRequest("/savings", { method: "GET" })
      setGoals(data.goals || [])
    } catch (err) {
      const msg = err.message || "something went wrong loading goals."
      setMessage(msg)

      const lower = msg.toLowerCase()
      if (lower.includes("not logged in") || lower.includes("invalid or expired")) {
        navigate("/auth")
      }
    }
  }


  // submit handler for creating a new goal
  async function handleCreateGoal(e) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const body = {
        label,
        amount,
        lockUntil,
        emergencyAllowed,
      }

      // POST /api/savings
      await apiRequest("/savings", {
        method: "POST",
        body: JSON.stringify(body),
      })

      setMessage("savings goal created!")

      // reset form fields
      setLabel("")
      setAmount("")
      setLockUntil("")
      setEmergencyAllowed(true)

      // refresh the list so we see the new goal
      await loadGoals()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  // click handler for emergency withdraw
  async function handleEmergencyWithdraw(id) {
    setMessage("")

    try {
      // POST /api/savings/:id/emergency-withdraw
      const path = `/savings/${id}/emergency-withdraw`
      const data = await apiRequest(path, {
        method: "POST",
      })

      setMessage(data.message || "withdrawal processed.")
      await loadGoals()
    } catch (err) {
      setMessage(err.message)
    }
  }

  // log the user out (clear cookie on backend)
  async function handleLogout() {
    setMessage("")

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      })

      // after logout, send back to landing page
      navigate("/")
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <main className="dashboard">
              <div className="demo-banner">
        demo only: this version stores data in memory, not a real bank. I will add Baad in time please stay posted.
      </div>

      <header className="dashboard-header">
        <div>
          <h1>venus dashboard</h1>
          <p className="tagline">lock your money on purpose.</p>
                    <p className="total-locked">
            total locked: ${totalLockedAmount.toFixed(2)}
          </p>

        </div>
        <button type="button" onClick={handleLogout}>
          log out
        </button>
      </header>

      {/* create goal section */}
      <section className="dashboard-section">
        <h2>create a savings goal</h2>

        <form className="goal-form" onSubmit={handleCreateGoal}>
          <label>
            goal name
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. emergency fund, rent buffer, trip"
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
              min={new Date().toISOString().slice(0, 10)} // today at minimum
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

          <button type="submit" disabled={loading}>
            {loading ? "saving goal..." : "lock this money"}
          </button>
        </form>
      </section>

      {/* list of goals section */}
      <section className="dashboard-section">
        <h2>your savings goals</h2>



        <ul className="goals-list">
          {goals.map((goal) => {
            const isLocked = goal.status === "locked"
            const emergencyInfo = goal.emergencyAllowed
              ? goal.emergencyUsed
                ? "emergency used"
                : "emergency allowed"
              : "no emergency"

            return (
              <li key={goal.id} className="goal-card">
                <h3>{goal.label}</h3>
                <p>amount: ${goal.amount}</p>
                <p>lock until: {goal.lockUntil}</p>
                <p>status: {goal.status}</p>
                <p>{emergencyInfo}</p>

                               {isLocked && (
                  <button
                    type="button"
                    onClick={() => handleEmergencyWithdraw(goal.id)}
                  >
                    emergency withdraw
                  </button>
                )}
             </li>
            )
          })}
        </ul>
      </section>

      {message && <p className="dashboard-message">{message}</p>}
    </main>
  )
}

export default DashboardPage
