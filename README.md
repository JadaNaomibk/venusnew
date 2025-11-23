# Venus – Lockable Savings Demo (Day 2)

This is my capstone starter for **Venus**, a lockable savings web app.

### What works today (Day 2)

- Basic **Express backend** with:
  - `GET /api/health` – simple health check for debugging
  - `POST /api/auth/register` – create a user with email + password
  - `POST /api/auth/login` – log in with email + password
  - `POST /api/auth/logout` – clear the auth cookie

- **In-memory users** (no database yet) so I can focus on:
  - getting the **auth flow** right
  - proving I understand **cookies, JWTs, and basic security**

- **React + Vite frontend** with:
  - `LandingPage` at `/` – explains Venus and links to auth
  - `AuthPage` at `/auth`
    - toggle between **log in** and **sign up**
    - calls the backend using `fetch` via a small `apiRequest` helper
    - shows success / error messages

### Tech stack

- Backend: Node.js, Express, cookie-parser, cors, jsonwebtoken, bcrypt
- Frontend: React, React Router, Vite

### Next steps

- Add a **dashboard** page
- Add **lockable savings goals** with:
  - amount to lock
  - lock-until date
  - optional emergency withdrawal
- Replace in-memory data with a **real database** later
# venusnew
