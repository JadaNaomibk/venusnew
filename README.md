# Venus – Lockable Savings Demo

Venus is a little savings app I built to practice full-stack development and also play with a real idea I care about: **locking money on purpose** so it actually stays saved.

This version is a **prototype**: it has a real frontend and a real Node/Express auth backend, but it uses **mock data for savings goals** and localStorage instead of touching real bank accounts.

---

## What the app does

- Lets a user **sign up or log in** on an Auth page.
- After logging in, the user lands on a **Dashboard** where they can:
  - Create a **lockable savings goal** (goal name, amount, lock-until date).
  - Decide if **emergency withdraw** is allowed.
  - See a list of their goals with **status pills** like `locked`, `withdrawn`, and `emergency used`.
  - See a **progress bar** for each goal (e.g. `$25 out of $5000 saved`).
- Goals are stored in the browser using **localStorage**, so the data sticks around even if the page refreshes.
- There is an **Insights** page that summarizes behavior and can warn users if they withdraw too often.

No real money moves here. It’s all about the **logic and flow** of a future ethical savings app.

---

## Tech stack

**Frontend (client)**

- React + Vite
- React Router (for `/`, `/auth`, `/dashboard`, `/insights`)
- Custom components: `NavBar`, `GoalCard`, `ProgressBar`, `SavingsTipPanel`
- LocalStorage for keeping savings goals between refreshes

**Backend (server)**

- Node.js + Express
- `bcryptjs` for hashing passwords
- `jsonwebtoken` for issuing JWTs
- `cookie-parser` + CORS for safe cookies and cross-origin requests

---

## How to run it locally

### 1. Start the backend (auth server)

```bash
cd server
npm install        # first time only
npm run dev        # starts Express on http://localhost:5001
``
