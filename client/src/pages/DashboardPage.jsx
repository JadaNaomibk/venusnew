// src/pages/DashboardPage.jsx
// demo dashboard that "locks" a savings amount for a period of time.
// all data lives in localStorage – this is NOT real money.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';
import CheckUploadBox from '../components/CheckUploadBox.jsx';

const STORAGE_KEY = 'venus-demo-savings';

function DashboardPage() {
  const navigate = useNavigate();

  // core saved state
  const [goalName, setGoalName] = useState('');
  const [lockedAmount, setLockedAmount] = useState('');
  const [lockPeriodWeeks, setLockPeriodWeeks] = useState(2);
  const [lockEndDate, setLockEndDate] = useState(null);

  // UI-only extras
  const [statusText, setStatusText] = useState('');
  const [checkFileName, setCheckFileName] = useState('');
  const [remainingDays, setRemainingDays] = useState(null);

  // load from localStorage on first render
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);

      setGoalName(data.goalName || '');
      setLockedAmount(data.lockedAmount || '');
      setLockPeriodWeeks(data.lockPeriodWeeks || 2);
      setLockEndDate(data.lockEndDate || null);
      setCheckFileName(data.checkFileName || '');
    } catch (err) {
      console.error('bad localStorage data, clearing...', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // whenever lockEndDate changes, recalc remaining days
  useEffect(() => {
    if (!lockEndDate) {
      setRemainingDays(null);
      setStatusText('');
      return;
    }

    const end = new Date(lockEndDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setRemainingDays(0);
      setStatusText('your lock is over — you can move this money now.');
    } else {
      setRemainingDays(diffDays);
      setStatusText(`stay strong. about ${diffDays} day(s) left in your lock.`);
    }
  }, [lockEndDate]);

  function persistState(next) {
    const payload = {
      goalName: next.goalName ?? goalName,
      lockedAmount: next.lockedAmount ?? lockedAmount,
      lockPeriodWeeks: next.lockPeriodWeeks ?? lockPeriodWeeks,
      lockEndDate: next.lockEndDate ?? lockEndDate,
      checkFileName: next.checkFileName ?? checkFileName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function handleStartLock(e) {
    e.preventDefault();

    if (!goalName || !lockedAmount || !lockPeriodWeeks) {
      alert('please fill in goal, amount, and lock period.');
      return;
    }

    const weeks = Number(lockPeriodWeeks);
    if (Number.isNaN(weeks) || weeks <= 0) {
      alert('lock period must be a positive number.');
      return;
    }

    const now = new Date();
    const end = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

    setLockEndDate(end.toISOString());
    persistState({
      goalName,
      lockedAmount,
      lockPeriodWeeks: weeks,
      lockEndDate: end.toISOString(),
    });
  }

  function handleUploadSelected(name) {
    setCheckFileName(name);
    persistState({ checkFileName: name });
  }

  function handleReset() {
    setGoalName('');
    setLockedAmount('');
    setLockPeriodWeeks(2);
    setLockEndDate(null);
    setStatusText('');
    setCheckFileName('');
    setRemainingDays(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('logout error (continuing anyway):', err);
    } finally {
      navigate('/auth');
    }
  }

  const hasActiveLock = Boolean(lockEndDate);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>venus dashboard</h1>
          <p className="subtitle">
            this is a mock-only lockable savings flow – perfect for prototyping the app
            before touching real bank accounts.
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          log out
        </button>
      </header>

      <section className="card">
        <h2>set or update your lock</h2>
        <form className="lock-form" onSubmit={handleStartLock}>
          <label>
            savings goal name
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="puerto rico trip, 3 months of rent, emergency cushion..."
            />
          </label>

          <label>
            amount to &quot;lock&quot; (demo only)
            <input
              type="number"
              min="0"
              step="10"
              value={lockedAmount}
              onChange={(e) => setLockedAmount(e.target.value)}
              placeholder="e.g. 500"
            />
          </label>

          <label>
            lock period (weeks)
            <input
              type="number"
              min="1"
              value={lockPeriodWeeks}
              onChange={(e) => setLockPeriodWeeks(e.target.value)}
            />
          </label>

          <label>
            pretend deposit method
            <select disabled value="">
              <option value="">bank transfer (future)</option>
              <option value="">upload check (future)</option>
            </select>
          </label>

          <CheckUploadBox onImageSelected={handleUploadSelected} />

          <button type="submit">
            {hasActiveLock ? 'update lock' : 'start lock'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>lock status</h2>

        {!hasActiveLock ? (
          <p className="muted">
            you don&apos;t have a mock lock started yet. create one above to see how the
            flow feels.
          </p>
        ) : (
          <div className="status-grid">
            <div className="status-item">
              <span className="label">goal</span>
              <span className="value">{goalName}</span>
            </div>
            <div className="status-item">
              <span className="label">locked amount</span>
              <span className="value">${lockedAmount}</span>
            </div>
            <div className="status-item">
              <span className="label">lock period</span>
              <span className="value">{lockPeriodWeeks} week(s)</span>
            </div>
            <div className="status-item">
              <span className="label">lock ends</span>
              <span className="value">
                {lockEndDate ? new Date(lockEndDate).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="status-item">
              <span className="label">days remaining</span>
              <span className="value">
                {remainingDays === null ? '-' : remainingDays}
              </span>
            </div>
            <div className="status-item">
              <span className="label">mock check upload</span>
              <span className="value">{checkFileName || 'none yet'}</span>
            </div>
          </div>
        )}

        {statusText && <p className="status-text">{statusText}</p>}

        <button className="secondary-btn" type="button" onClick={handleReset}>
          clear mock data
        </button>
      </section>

      <section className="card">
        <h2>next steps for the real app</h2>
        <ul className="todo-list">
          <li>swap localStorage for a real database (e.g. postgres, dynamodb, mongodb).</li>
          <li>connect stripe / plaid or another provider for real deposits.</li>
          <li>
            enforce real lock periods with backend rules so people can&apos;t unlock early
            without friction.
          </li>
          <li>
            design community investment rules so venus can fund local businesses while
            growing user savings.
          </li>
        </ul>
      </section>
    </main>
  );
}

export default DashboardPage;