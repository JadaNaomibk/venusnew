# Venus – Lockable Savings Demo 

This is my capstone starter for **Venus**, a lockable savings web app.

## How to run this project locally

1. clone the repo

```bash
git clone https://github.com/JadaNaomibk/Venus.git
cd Venus


### What works 11.23

- I broke the app twice lol once because i started up a day letter and messep up my files when i  tried to make sure it was being pushed to git ... i ended up makinf a new rep and starting again troublleshooting file will be included .

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

## What this Venus MVP does

- lets a user:
  - create an account (email + password)
  - log in and get a secure cookie
  - create savings goals with:
    - label (what is this for)
    - amount
    - lock-until date
    - emergency option
  - see all their goals on a simple dashboard
  - mark a goal as withdrawn using “emergency withdraw”
  - log out (clears cookie)

- backend:
  - Node + Express
  - in-memory users and goals (no real database yet)
  - JWT-based auth with httpOnly cookie

- frontend:
  - React + Vite
  - routes: `/`, `/auth`, `/dashboard`
  - uses a tiny `apiRequest` helper for all fetch calls
