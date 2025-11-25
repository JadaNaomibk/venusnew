// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from './models/User.js';
import Goal from './models/Goal.js';

dotenv.config();

const app = express();

// ---------- CONFIG ----------
const PORT = process.env.PORT || 5001;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/venus_savings';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// ---------- DB CONNECTION ----------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
  });

// ---------- AUTH HELPERS ----------
function createToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const token = req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({ message: 'not authenticated' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid or expired token' });
  }
}

// ---------- AUTH ROUTES ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'account already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash
    });

    const token = createToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false // set true when you deploy on https
    });

    return res.status(201).json({
      message: 'account created',
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'invalid credentials' });
    }

    const token = createToken(user);
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });

    return res.json({
      message: 'logged in',
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  return res.json({ message: 'logged out' });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id email');
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    return res.json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// ---------- GOALS ROUTES (CRUD) ----------

// GET all goals for this user
app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    return res.json({
      goals: goals.map((g) => ({
        id: g._id.toString(),
        userId: g.userId.toString(),
        label: g.label,
        amount: g.amount,
        lockUntil: g.lockUntil,
        status: g.status,
        emergencyAllowed: g.emergencyAllowed,
        emergencyUsed: g.emergencyUsed,
        withdrawCount: g.withdrawCount,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      }))
    });
  } catch (err) {
    console.error('get goals error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// CREATE a goal
app.post('/api/goals', requireAuth, async (req, res) => {
  try {
    const { label, amount, lockUntil, emergencyAllowed = true } =
      req.body || {};

    if (!label || !amount || !lockUntil) {
      return res.status(400).json({
        message: 'label, amount, and lockUntil are required'
      });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ message: 'amount must be a positive number' });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      label: String(label).trim(),
      amount: numericAmount,
      lockUntil,
      emergencyAllowed: !!emergencyAllowed
    });

    return res.status(201).json({
      message: 'goal created',
      goal: {
        id: goal._id.toString(),
        userId: goal.userId.toString(),
        label: goal.label,
        amount: goal.amount,
        lockUntil: goal.lockUntil,
        status: goal.status,
        emergencyAllowed: goal.emergencyAllowed,
        emergencyUsed: goal.emergencyUsed,
        withdrawCount: goal.withdrawCount,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt
      }
    });
  } catch (err) {
    console.error('create goal error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// UPDATE a goal (including emergency-withdraw action)
app.patch('/api/goals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, label, amount, lockUntil, emergencyAllowed } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'goal not found' });
    }

    if (action === 'emergency-withdraw') {
      if (!goal.emergencyAllowed) {
        return res
          .status(400)
          .json({ message: 'emergency withdrawal not allowed for this goal' });
      }

      if (goal.status === 'withdrawn') {
        return res
          .status(400)
          .json({ message: 'goal is already withdrawn from lock' });
      }

      if (goal.withdrawCount >= 1) {
        return res.status(400).json({
          message:
            'you already used emergency withdraw on this goal. no more withdrawals.'
        });
      }

      goal.status = 'withdrawn';
      goal.emergencyUsed = true;
      goal.withdrawCount += 1;
    } else {
      // generic edit (label, amount, date, emergency flag)
      if (typeof label === 'string') {
        goal.label = label.trim();
      }
      if (amount !== undefined) {
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
          return res
            .status(400)
            .json({ message: 'amount must be a positive number' });
        }
        goal.amount = numericAmount;
      }
      if (typeof lockUntil === 'string') {
        goal.lockUntil = lockUntil;
      }
      if (typeof emergencyAllowed === 'boolean') {
        goal.emergencyAllowed = emergencyAllowed;
      }
    }

    await goal.save();

    return res.json({
      message: 'goal updated',
      goal: {
        id: goal._id.toString(),
        userId: goal.userId.toString(),
        label: goal.label,
        amount: goal.amount,
        lockUntil: goal.lockUntil,
        status: goal.status,
        emergencyAllowed: goal.emergencyAllowed,
        emergencyUsed: goal.emergencyUsed,
        withdrawCount: goal.withdrawCount,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt
      }
    });
  } catch (err) {
    console.error('update goal error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// DELETE a goal
app.delete('/api/goals/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Goal.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: 'goal not found' });
    }

    return res.json({ message: 'goal deleted' });
  } catch (err) {
    console.error('delete goal error:', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Venus auth server listening on port ${PORT}`);
});
