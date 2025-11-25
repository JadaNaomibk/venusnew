// client/src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { apiRequest } from '../api.js';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await apiRequest('/auth/me', { method: 'GET' });
        const goalsRes = await apiRequest('/goals', { method: 'GET' });

        if (!cancelled) {
          setUser(me.user || null);
          setGoals(Array.isArray(goalsRes.goals) ? goalsRes.goals : []);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err.message);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalGoals = goals.length;
  const withdrawnCount = goals.filter((g) => g.status === 'withdrawn').length;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>profile</h1>
        <p className="dashboard-subtitle">
          quick overview of your venus activity.
        </p>
      </header>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">email</span>
          <span className="summary-value">
            {user ? user.email : 'not loaded'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">total goals</span>
          <span className="summary-value">{totalGoals}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">goals withdrawn</span>
          <span className="summary-value">{withdrawnCount}</span>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;
