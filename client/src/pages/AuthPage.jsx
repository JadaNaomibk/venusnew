// client/src/pages/AuthPage.jsx
// login / sign-up screen that talks to the backend auth routes

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api.js';

function AuthPage() {
  const [mode, setMode] = useState('login'); // "login" or "register"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';

      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setMessage(data.message || 'success.');
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const titleText =
    mode === 'login'
      ? 'welcome back to venus'
      : 'create your venus account';

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
        venus is in prototype mode. please don&apos;t reuse real banking
        passwords here.
      </p>
    </main>
  );
}

export default AuthPage;
