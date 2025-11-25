// src/pages/DashboardPage.jsx
// Venus dashboard – lockable savings demo using ONLY local state + localStorage

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SavingsQuote from '../components/SavingsQuote.jsx';

function createGoalObject({ label, amount, lockUntil, emergencyAllowed }) {
  const now = new Date();

  return {
    id: String(now.getTime()) + '-' + Math.random().toString(16).slice(2),
    label: String(label).trim(),
    amount: Number(amount),
    lockUntil, // date string
    createdAt: now.toISOString(),
    status: 'locked', // 'locked' | 'withdrawn'
    emergencyAllowed: !!emergencyAllowed,
    emergencyUsed: false,
    withdrawCount: 0,
  };
}

function DashboardPage() {
  const navigate = useNavigate();

  // form state
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [lockUntil, setLockUntil] = useState('');
  const [emergencyAllowed, setEmergencyAllowed] = useState(true);

  // goals + messaging
  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState('');

  // load from localStorage on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('venusGoals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch (err) {
      console.error('error reading venusGoals from localStorage:', err);
    }
  }, []);

  // save to localStorage any time goals change
  useEffect(() => {
    try {
      localStorage.setItem('venusGoals', JSON.stringify(goals));
    } catch (err) {
      console.error('error saving venusGoals to localStorage:', err);
    }
  }, [goals]);

  function handleCreateGoal(event) {
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

    const newGoal = createGoalObject({
      label,
      amount: numericAmount,
      lockUntil,
      emergencyAllowed,
    });

    setGoals((prev) => [newGoal, ...prev]);

    setLabel('');
    setAmount('');
    setLockUntil('');
    setEmergencyAllowed(true);

    setMessage('new savings goal locked.');
  }

  function handleEmergencyWithdraw(goalId) {
    setMessage('');

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal;

        if (goal.status === 'withdrawn') {
          return goal;
        }

        const newWithdrawCount = (goal.withdrawCount || 0) + 1;

        return {
          ...goal,
          status: 'withdrawn',
          emergencyUsed: true,
          withdrawCount: newWithdrawCount,
        };
      }),
    );

    setMessage(
      'goal withdrawn from lock (demo only, no real money is moved).',
    );
  }

  const totalLocked = goals
    .filter((g) => g.status === 'locked')
    .reduce((sum, g) => sum + g.amount, 0);

  const totalWithdrawals = goals.reduce(
    (sum, g) => sum + (g.withdrawCount || 0),
    0,
  );

  function handleLogout() {
    // in this mock version, just clear local goals + go back to auth
    try {
      localStorage.removeItem('venusGoals');
    } catch (err) {
      console.error('error clearing venusGoals on logout:', err);
    }
    navigate('/auth');
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <p
          style={{
            textAlign: 'center',
            marginTop: '0.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          logged in (demo mode – no real bank accounts connected)
        </p>

        <h1>your venus dashboard</h1>

        <p className="dashboard-subtitle">
          lock money on purpose, not by accident. practice leaving it alone.
        </p>

        <button
          onClick={handleLogout}
          className="secondary-button"
          style={{ marginTop: '1rem' }}
          type="button"
        >
          log out
        </button>
      </header>

      {/* summary bar */}
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
          <span className="summary-label">emergency withdrawals</span>
          <span className="summary-value">{totalWithdrawals}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        {/* left side: create goal form */}
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

            <button type="submit">lock this money (demo)</button>
          </form>

          {/* motivational block */}
          <SavingsQuote />
        </section>

        {/* right side: goals list */}
        <section className="dashboard-section">
          <h2>your savings goals</h2>

          {goals.length === 0 && (
            <p className="empty-state">
              you don&apos;t have any locked goals yet. start with something
              tiny.
            </p>
          )}

          <ul className="goals-list">
            {goals.map((goal) => {
              const withdrawCount = goal.withdrawCount || 0;

              return (
                <li key={goal.id} className="goal-card">
                  <div className="goal-card-main">
                    <h3>{goal.label}</h3>
                    <p className="goal-amount">
                      ${goal.amount.toFixed(2)}
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

                    {withdrawCount > 0 && (
                      <span className="status-pill">
                        withdrawals: {withdrawCount}
                      </span>
                    )}

                    {goal.status === 'locked' && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEmergencyWithdraw(goal.id)}
                      >
                        emergency withdraw (demo)
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
