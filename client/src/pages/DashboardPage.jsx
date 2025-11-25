// src/pages/DashboardPage.jsx
// Dashboard page for Venus.
//
// This version uses ONLY FRONTEND STATE (localStorage) for savings goals.
// - Auth still talks to the backend (JWT in cookie).
// - Savings goals are stored under "venusGoals" in localStorage.
// - We track:
//     * targetAmount  → what you want to save
//     * currentAmount → how much is "saved" so far
//     * withdrawCount → how many times you broke the lock on that goal
//     * penaltyAmount → simulated penalties after the first emergency

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api.js'
import GoalCard from '../components/GoalCard.jsx'
import SavingsTipPanel from '../components/SavingsTipPanel.jsx'

const STORAGE_KEY = 'venusGoals'

function DashboardPage() {
  const navigate = useNavigate()

  // form state
  const [label, setLabel] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialDeposit, setInitialDeposit] = useState('')
  const [lockUntil, setLockUntil] = useState('')
  const [emergencyAllowed, setEmergencyAllowed] = useState(true)

  // goals + messages
  const [goals, setGoals] = useState([])
  const [message, setMessage] = useState('')

  // --------------------------------------------
  // Load goals from localStorage on first render
  // --------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return

      const normalized = parsed.map((g) => ({
        id:
          g.id ||
          `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label: String(g.label || '').trim(),
        targetAmount:
          typeof g.targetAmount === 'number'
            ? g.targetAmount
            : Number(g.amount) || 0,
        currentAmount:
          typeof g.currentAmount === 'number'
            ? g.currentAmount
            : Number(g.amount) || 0,
        lockUntil: g.lockUntil || '',
        createdAt: g.createdAt || new Date().toISOString(),
        status: g.status === 'withdrawn' ? 'withdrawn' : 'locked',
        emergencyAllowed:
          typeof g.emergencyAllowed === 'boolean'
            ? g.emergencyAllowed
            : true,
        withdrawCount:
          typeof g.withdrawCount === 'number' ? g.withdrawCount : 0,
        penaltyAmount:
          typeof g.penaltyAmount === 'number' ? g.penaltyAmount : 0,
      }))

      setGoals(normalized)
    } catch (err) {
      console.error('error reading goals from localStorage', err)
    }
  }, [])

  // --------------------------------------------
  // Persist goals back to localStorage
  // --------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    } catch (err) {
      console.error('error saving goals to localStorage', err)
    }
  }, [goals])

  // --------------------------------------------
  // Derived stats for the summary cards
  // --------------------------------------------
  const totalCurrent = goals.reduce(
    (sum, g) => sum + (g.currentAmount || 0),
    0
  )
  const totalTarget = goals.reduce(
    (sum, g) => sum + (g.targetAmount || 0),
    0
  )
  const totalWithdrawn = goals.filter((g) => g.status === 'withdrawn').length
  const totalPenalty = goals.reduce(
    (sum, g) => sum + (g.penaltyAmount || 0),
    0
  )
  const totalWithdrawAttempts = goals.reduce(
    (sum, g) => sum + (g.withdrawCount || 0),
    0
  )

  // --------------------------------------------
  // Log out (talks to backend, but goals stay on device)
  // --------------------------------------------
  async function handleLogout() {
    setMessage('')

    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (err) {
      // If logout fails, we still send them back to auth;
      // this is just a demo, not real banking.
      console.error('logout error:', err.message)
    } finally {
      navigate('/auth')
    }
  }

  // --------------------------------------------
  // Create a new savings goal
  // --------------------------------------------
  function handleCreateGoal(e) {
    e.preventDefault()
    setMessage('')

    if (!label || !targetAmount || !lockUntil) {
      setMessage('please fill in goal name, target amount, and lock date.')
      return
    }

    const numericTarget = Number(targetAmount)
    const numericDeposit = initialDeposit ? Number(initialDeposit) : 0

    if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
      setMessage('target amount must be a positive number.')
      return
    }

    if (!Number.isFinite(numericDeposit) || numericDeposit < 0) {
      setMessage('deposit cannot be negative.')
      return
    }

    if (numericDeposit > numericTarget) {
      setMessage('deposit cannot be larger than the target.')
      return
    }

    const now = new Date()

    const goal = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      label: String(label).trim(),
      targetAmount: numericTarget,
      currentAmount: numericDeposit,
      lockUntil,
      createdAt: now.toISOString(),
      status: 'locked',
      emergencyAllowed,
      withdrawCount: 0,
      penaltyAmount: 0,
    }

    setGoals((prev) => [goal, ...prev])

    // reset form
    setLabel('')
    setTargetAmount('')
    setInitialDeposit('')
    setLockUntil('')
    setEmergencyAllowed(true)

    setMessage('new savings goal created and locked.')
  }

  // --------------------------------------------
  // Emergency withdraw with penalty simulation
  // --------------------------------------------
  function handleEmergencyWithdraw(goalId) {
    setMessage('')

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal

        // already withdrawn → no change
        if (goal.status === 'withdrawn') {
          return goal
        }

        const nextWithdrawCount = (goal.withdrawCount || 0) + 1
        let penaltyAmount = goal.penaltyAmount || 0
        let penaltyApplied = false

        // First emergency: no penalty.
        // Second (and beyond): simulate a 10% penalty.
        if (nextWithdrawCount > 1) {
          const penalty = Math.round(goal.currentAmount * 0.1 * 100) / 100
          penaltyAmount += penalty
          penaltyApplied = true
        }

        const updated = {
          ...goal,
          status: 'withdrawn',
          withdrawCount: nextWithdrawCount,
          penaltyAmount,
        }

        if (penaltyApplied) {
          setMessage(
            'emergency used again – simulating a 10% penalty on this goal.'
          )
        } else {
          setMessage('goal withdrawn from lock (demo only).')
        }

        return updated
      })
    )
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p className="logged-note">logged in • demo savings profile</p>
        <h1>your venus dashboard</h1>
        <p className="dashboard-subtitle">
          choose a goal, lock a number, and train yourself not to touch it.
        </p>
        <button
          type="button"
          className="secondary-button logout-button"
          onClick={handleLogout}
        >
          log out
        </button>
      </header>

      {/* summary cards at the top */}
      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-label">active goals</span>
          <span className="stat-value">{goals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">saved vs targets</span>
          <span className="stat-value">
            ${totalCurrent.toFixed(2)} / ${totalTarget.toFixed(2)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">emergency withdrawals</span>
          <span className="stat-value">{totalWithdrawAttempts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">simulated penalties</span>
          <span className="stat-value">${totalPenalty.toFixed(2)}</span>
        </div>
      </section>

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
                placeholder="ex: puerto rico trip, rent buffer, camera"
                required
              />
            </label>

            <label>
              target amount
              <input
                type="number"
                min="1"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="how much do you want to save in total?"
                required
              />
            </label>

            <label>
              first deposit (optional)
              <input
                type="number"
                min="0"
                step="0.01"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="start with something small, like 25.00"
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
              allow one emergency withdrawal on this goal
            </label>

            <button type="submit">lock this money (demo)</button>
          </form>

          <SavingsTipPanel />
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
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEmergencyWithdraw={handleEmergencyWithdraw}
              />
            ))}
          </ul>
        </section>
      </section>

      {message && <p className="dashboard-message">{message}</p>}
    </main>
  )
}

export default DashboardPage
