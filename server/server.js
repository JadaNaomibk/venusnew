// server.js
// main file for my auth + savings backend (NO MongoDB version).
// - uses Express
// - keeps users + savings goals in memory (arrays/objects)
// - has:
//    * /api/health
//    * /api/auth/register
//    * /api/auth/login
//    * /api/auth/logout
//    * /api/savings (GET)
//    * /api/savings (POST)
//    * /api/savings/:id/emergency-withdraw

import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()

const app = express()

// ⬇️ In-memory data (for prototype only)
// this is NOT a real database.
// when you restart the server, these will reset.
const users = []            // list of user objects: { id, email, passwordHash }
const savingsByUserId = {}  // keys = userId, value = [ goals... ]

// ⬇️ Basic helpers from .env
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// ⬇️ Middleware
// let Express read JSON in request bodies
app.use(express.json())

// let us read cookies (for authToken)
app.use(cookieParser())

// allow the React client to call this API in dev
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
)

// ================ AUTH HELPERS ==================

// tiny helper to create a JWT token from a user id
function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// middleware that checks the auth cookie and attaches userId to the request
function authRequired(req, res, next) {
  const token = req.cookies.authToken

  if (!token) {
    return res.status(401).json({ message: 'not logged in.' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    console.error('Error verifying token:', err)
    return res.status(401).json({ message: 'invalid or expired token.' })
  }
}

// ================ HEALTH CHECK ==================

// Quick "is the backend alive?" route.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'auth backend is running (no Mongo).' })
})

// ================ AUTH ROUTES ===================

// POST /api/auth/register
// create a new user in the in-memory users array
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'please enter an email and password.' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // check if email already exists
    const existing = users.find((u) => u.email === normalizedEmail)
    if (existing) {
      return res
        .status(409)
        .json({ message: 'this email already has an account.' })
    }

    // hash the password so we never store it in plain text
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = {
      id: String(Date.now()), // quick + dirty user id
      email: normalizedEmail,
      passwordHash,
    }

    users.push(newUser)

    const token = createToken(newUser.id)

    res
      .cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({
        message: 'account created.',
        user: { id: newUser.id, email: newUser.email },
      })
  } catch (err) {
    console.error('Error in /register:', err)
    res.status(500).json({ message: 'server error while registering.' })
  }
})

// POST /api/auth/login
// check email + password against users[]
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'please enter an email and password.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = users.find((u) => u.email === normalizedEmail)

    if (!user) {
      return res.status(401).json({ message: 'email or password is wrong.' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'email or password is wrong.' })
    }

    const token = createToken(user.id)

    res
      .cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'logged in.',
        user: { id: user.id, email: user.email },
      })
  } catch (err) {
    console.error('Error in /login:', err)
    res.status(500).json({ message: 'server error while logging in.' })
  }
})

// POST /api/auth/logout
// clear auth cookie so user is logged out
app.post('/api/auth/logout', (req, res) => {
  res
    .clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    })
    .status(200)
    .json({ message: 'logged out.' })
})

// ================ SAVINGS ROUTES =================

// GET /api/savings
// return all savings goals for logged-in user
app.get('/api/savings', authRequired, (req, res) => {
  const userId = req.userId
  const goals = savingsByUserId[userId] || []
  res.json({ goals })
})

// POST /api/savings
// create a new savings goal
app.post('/api/savings', authRequired, (req, res) => {
  const userId = req.userId
  const { label, amount, lockUntil, emergencyAllowed } = req.body

  if (!label || !amount || !lockUntil) {
    return res
      .status(400)
      .json({ message: 'please provide a label, amount, and lock date.' })
  }

  const numericAmount = Number(amount)
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res
      .status(400)
      .json({ message: 'amount must be a positive number.' })
  }

  const goal = {
    id: String(Date.now()),
    label: String(label).trim(),
    amount: numericAmount,
    lockUntil, // expect "YYYY-MM-DD"
    createdAt: new Date().toISOString(),
    status: 'locked', // 'locked' | 'withdrawn'
    emergencyAllowed: !!emergencyAllowed,
    emergencyUsed: false,
  }

  if (!savingsByUserId[userId]) {
    savingsByUserId[userId] = []
  }

  savingsByUserId[userId].push(goal)

  res.status(201).json({
    message: 'savings goal created.',
    goal,
  })
})

// POST /api/savings/:id/emergency-withdraw
// allow early withdrawal if lock date passed or emergencyAllowed is true
app.post('/api/savings/:id/emergency-withdraw', authRequired, (req, res) => {
  const userId = req.userId
  const goalId = req.params.id

  const goals = savingsByUserId[userId] || []
  const goal = goals.find((g) => g.id === goalId)

  if (!goal) {
    return res.status(404).json({ message: 'savings goal not found.' })
  }

  if (goal.status === 'withdrawn') {
    return res.status(400).json({ message: 'this goal was already withdrawn.' })
  }

  const now = new Date()
  const lockDate = new Date(goal.lockUntil)
  const isUnlockedByTime = now >= lockDate

  if (!isUnlockedByTime && !goal.emergencyAllowed) {
    return res
      .status(403)
      .json({ message: 'this goal does not allow emergency withdrawals yet.' })
  }

  goal.status = 'withdrawn'
  goal.emergencyUsed = !isUnlockedByTime

  res.json({
    message: isUnlockedByTime
      ? 'goal withdrawn (lock date passed).'
      : 'emergency withdrawal processed.',
    goal,
  })
})

// ================ START SERVER ===================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (no MongoDB)`)
})
