// server.js
// backend for my Venus demo, day 2 (landing + auth only).
// - express app
// - in-memory "users" list (no database yet)
// - basic register / login / logout with hashed passwords and a cookie token

import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()

const app = express()

// in-memory users (prototype only)
const users = []

// config values
const PORT = process.env.PORT || 5001
const CLIENT_URL = process.env.CLIENT_URL
const JWT_SECRET = process.env.JWT_SECRET

// basic middleware: json + cookies
app.use(express.json())
app.use(cookieParser())

// allow my React dev server to talk to this API
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
)

// helper to make a JWT token for a user
function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'auth backend is running.' })
})

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

    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )
    if (existing) {
      return res
        .status(409)
        .json({ message: 'this email already has an account.' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = {
      id: String(Date.now()),
      email: email.toLowerCase().trim(),
      passwordHash,
    }

    users.push(newUser)

    const token = createToken(newUser.id)

    res
      .cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
// check email + password against the in-memory users list
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'please enter an email and password.' })
    }

    const user = users.find(
      (u) => u.email === email.toLowerCase().trim()
    )
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
// clear the auth cookie
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
