// client/src/pages/DashboardPage.jsx
// dashboard page for Venus.
// this version uses the backend API + MongoDB to store savings goals.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';

function DashboardPage() {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [lockUntil, setLockUntil] = useState('');
  const [emergencyAllowed, setEmergencyAllowed] = useState(true);

  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingGoals, setLoadingGoals] = useState(true);

  const navigate = useNavigate();

  // load goals on mount
  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      setLoadingGoals(true);
      setMessage('');

      try {
        const data = await apiRequest('/goals', { method: 'GET' });
        if (!cancelled) {
          setGoals(Array.isArray(data.goals) ? data.goals : []);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingGoals(false);
        }
      }
    }

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateGoal(event) {
    event.preventDefault();
    setMessage('');

    if (!label || !amount || !lockUntil) {
      setMessage('please fill out all the fields first.');
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setMessage('amount must be a positive number.');
      return;
    }

    try {
      const data = await apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          label,
          amount: numericAmount,
          lockUntil,
          emergencyAllowed
        })
      });

      if (data.goal) {
        setGoals((prev) => [data.goal, ...prev]);
      }

      setLabel('');
      setAmount('');
      setLockUntil('');
      setEmergencyAllowed(true);

      setMessage('new savings goal locked.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleEmergencyWithdraw(goalId) {
    setMessage('');

    try {
      const data = await apiRequest(`/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'emergency-withdraw' })
      });

      if (data.goal) {
        setGoals((prev) =>
          prev.map((g) => (g.id === data.goal.id ? data.goal : g))
        );
      }

      setMessage(
        'goal withdrawn from lock (demo only, no real money is moving).'
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteGoal(goalId) {
    setMessage('');

    try {
      await apiRequest(`/goals/${goalId}`, {
        method: 'DELETE'
      });

      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      setMessage('goal deleted.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (_) {
      // ignore errors on logout
    } finally {
      setGoals([]);
      navigate('/auth');
    }
  }

  const totalLocked = goals
    .filter((goal) => goal.status === 'locked')
    .reduce((sum, goal) => sum + Number(goal.amount || 0), 0);

  const totalWithdrawn = goals
    .filter((goal) => goal.status === 'withdrawn')
    .reduce((sum, goal) => sum + Number(goal.amount || 0), 0);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p
          style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            color: 'var(--text-muted)'
          }}
        >
          logged in (demo mode – no real bank connections)
        </p>

        <h1>your venus dashboard</h1>

        <button
          onClick={handleLogout}
          className="secondary-button"
          style={{ marginTop: '1rem' }}
        >
          logout
        </button>

        <p className="dashboard-subtitle">
          lock small amounts on purpose, not by accident.
        </p>
      </header>

      <section className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">goals locked</span>
          <span className="summary-value">{goals.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">total locked</span>
          <span className="summary-value">
            ${totalLocked.toFixed(2)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">total withdrawn</span>
          <span className="summary-value">
            ${totalWithdrawn.toFixed(2)}
          </span>
        </div>
      </section>

      <section className="dashboard-grid">
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

        <section className="dashboard-section">
          <h2>your savings goals</h2>

          {loadingGoals && (
            <p className="empty-state">loading your goals...</p>
          )}

          {!loadingGoals && goals.length === 0 && (
            <p className="empty-state">
              you don&apos;t have any locked goals yet. start with something
              tiny.
            </p>
          )}

          <ul className="goals-list">
            {goals.map((goal) => (
              <li key={goal.id} className="goal-card">
                <div>
                  <h3>{goal.label}</h3>
                  <p className="goal-amount">
                    ${Number(goal.amount || 0).toFixed(2)}
                  </p>
                  <p className="goal-meta">
                    lock until: {goal.lockUntil}
                  </p>
                </div>

                <div className="goal-status-block">
                  <span
                    className={
                      'status-pill ' +
                      (goal.status === 'locked' ? 'locked' : 'withdrawn')
                    }
                  >
                    {goal.status}
                  </span>

                  {goal.emergencyAllowed && (
                    <span className="status-pill emergency">
                      {goal.emergencyUsed
                        ? 'emergency used'
                        : 'emergency allowed'}
                    </span>
                  )}

                  {goal.withdrawCount > 0 && (
                    <span className="status-pill warning">
                      withdrawals: {goal.withdrawCount}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {goal.status === 'locked' && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEmergencyWithdraw(goal.id)}
                      >
                        emergency withdraw
                      </button>
                    )}

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>

      {message && <p className="dashboard-message">{message}</p>}
    </main>
  );
}

export default DashboardPage;
