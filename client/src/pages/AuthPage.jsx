// src/pages/AuthPage.jsx
// lets someone log in or sign up, and talks to the backend auth routes.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';

function AuthPage() {
  // "mode" controls whether the form is in login or sign-up mode
  const [mode, setMode] = useState('login'); // "login" or "register"

  // basic form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // feedback + loading state
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // deposit selector (demo only, just for the UI)
  const [depositMethod, setDepositMethod] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // choose the backend path based on the mode
      const path = mode === 'login' ? '/auth/login' : '/auth/register';

      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // show whatever message the server sent back
      setMessage(data.message || 'success.');

      // after auth, send them to the dashboard
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const titleText =
    mode === 'login' ? 'welcome back to venus' : 'create your venus account';
  const buttonText = mode === 'login' ? 'log in' : 'create account';

  return (
    <main className="auth">
      <h1>venus auth</h1>
      <p className="subtitle">{titleText}</p>

      <div className="auth-toggle">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          log in
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          sign up
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          password
          <input
            type="password"
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          deposit method
          <select
            value={depositMethod}
            onChange={(e) => setDepositMethod(e.target.value)}
          >
            <option value="">select method</option>
            <option value="bank">bank transfer (mock)</option>
            <option value="check-upload">upload check (mock)</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'please wait...' : buttonText}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      <p className="auth-note">
        venus is in prototype mode. please don&apos;t use real banking passwords here.
      </p>
    </main>
  );
}

export default AuthPage;