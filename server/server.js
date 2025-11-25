// server/server.js
// Simple Express auth server for Venus demo.
// Uses in-memory users (NO database, NO real money).
// Safe for learning: do NOT use real passwords here.

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// --- basic middleware ---
app.use(express.json());
app.use(cookieParser());

// CORS so Vite (http://localhost:5173) can talk to this backend
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// --- very tiny in-memory "users table" ---
// This resets every time you restart the server.
const users = []; // { id, email, passwordHash }

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.authToken;
  if (!token) return res.status(401).json({ message: 'not authenticated' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'invalid token' });
  }
}

// --- routes ---

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'venus auth server running' });
});

// register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const existing = users.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'that email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: String(Date.now()),
      email: email.toLowerCase(),
      passwordHash,
    };
    users.push(newUser);

    const token = createToken(newUser);
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true if you ever use HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'account created (demo only).',
      user: { email: newUser.email },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'server error during registration.' });
  }
});

// login existing user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'invalid credentials.' });
    }

    const token = createToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'logged in (demo only).',
      user: { email: user.email },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'server error during login.' });
  }
});

// log out (clear cookie)
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  return res.json({ message: 'logged out.' });
});

// get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  return res.json({ user: { id: req.user.id, email: req.user.email } });
});

// catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: 'not found' });
});

app.listen(PORT, () => {
  console.log(`Venus auth server listening on port ${PORT}`);
});