# Venus Capstone – Developer Notes

## High-level Flow

1. **Landing Page (`/`)**
   - Simple explanation of the Venus idea.
   - Button sends users to `/auth`.

2. **Auth Page (`/auth`)**
   - `mode` state decides if we hit `/api/auth/login` or `/api/auth/register`.
   - Backend returns a JWT token in a cookie called `authToken`.
   - On success, I navigate to `/dashboard`.

3. **Dashboard (`/dashboard`)**
   - On mount, I call `/api/savings` with `credentials: "include"` so the cookie is sent.
   - If that works, I show a form to create a new savings goal and a list of goals.
   - Each goal has: `label`, `amount`, `lockUntil`, `status`, and emergency info.
   - I can hit `/api/savings/:id/emergency-withdraw` for an emergency withdraw.

## Backend Sketch

- `server/server.js`
  - Uses Express, cookie-parser, cors, jsonwebtoken, bcryptjs.
  - In-memory:
    - `users[]` – basic users with `id`, `email`, `passwordHash`
    - `savingsByUserId{}` – maps userId → array of savings goals
  - Routes:
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `POST /api/auth/logout`
    - `GET /api/savings`
    - `POST /api/savings`
    - `POST /api/savings/:id/emergency-withdraw`

I built this to prove I understand **end-to-end auth** and **stateful savings logic** even with beginner-level tools.
