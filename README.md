# Tollywala — Scrap Selling Platform

A full-stack app for booking doorstep scrap pickups: a live rate calculator
covering 48 materials, user accounts, pickup booking with tracking, and a
separate admin panel for managing rates and bookings.

## Live demo

| App | URL |
|---|---|
| Customer site | `<your Vercel URL here>` |
| Admin panel | `<your Vercel URL here>` |
| API | `<your Render URL here>` |

*(Note: the API runs on Render's free tier, which sleeps after 15 minutes
of inactivity — the first request after a quiet period can take ~1 minute
to respond while it wakes up.)*

## Project structure

This is three separate apps, not one monolith:

```
tollywala/
  backend/    Express + PostgreSQL API
  frontend/   Customer-facing React app       (deployed separately)
  admin/      Admin panel, a separate React app (deployed separately)
```

`frontend/` and `admin/` both talk to the same `backend/` API but are
independently deployable — the admin panel is not a route inside the
customer site, it's its own app with its own login and its own URL.

## Features

### Customer site
- Live payout calculator across 48 materials in 6 categories (paper,
  plastic, metal, glass, e-waste & appliances, other), priced per kg or
  per piece
- Account registration and login (JWT-based sessions, bcrypt-hashed
  passwords)
- Book a doorstep pickup with address and preferred date
- Personal dashboard showing booking history and status
- About and Contact pages
- Mobile-responsive navigation (hamburger menu below 768px)

### Admin panel
- Separate login that only accepts admin accounts
- Dashboard: total users, materials, bookings, pending pickups, total
  estimated value
- Materials & rates: inline-edit any rate/unit/category, add new
  materials, delete old ones — changes are live on the customer site
  immediately
- Bookings: view every booking across all users, filter and update
  status (pending / confirmed / completed / cancelled)
- Users: read-only roster with booking counts

## Tech stack

- **Frontend & Admin:** React 18, Vite, React Router
- **Backend:** Node.js, Express, JSON Web Tokens, bcrypt
- **Database:** PostgreSQL (via the `pg` client — works with any standard
  Postgres host)
- **Hosting (as deployed):** Vercel (customer site + admin panel as two
  separate projects), Render (API), Neon or Supabase (free Postgres)

## Architecture

```
┌─────────────────┐        ┌──────────────────┐
│  Customer site   │──┐     │   Admin panel     │──┐
│  (Vercel)         │  │     │   (Vercel)         │  │
└─────────────────┘  │     └──────────────────┘  │
                        │  REST / JSON               │
                        ▼                             ▼
                 ┌──────────────────────────────┐
                 │      Backend API (Render)      │
                 │   Express + JWT + bcrypt        │
                 └──────────────┬───────────────┘
                                  │
                                  ▼
                       ┌─────────────────┐
                       │  PostgreSQL      │
                       │  (Neon/Supabase) │
                       └─────────────────┘
```

## Local development setup

You'll run three servers at once during development.

### 1. Database

Use a free Postgres database from [neon.tech](https://neon.tech) or
[supabase.com](https://supabase.com) (recommended, since it matches
production), or point at a local Postgres instance if you have one
installed. Either way, you just need a connection string.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm start
```

Runs at `http://localhost:4000`. On first boot it creates the database
tables, seeds all 48 materials, and creates a default admin account —
watch the terminal output for its email/password if you didn't set your
own via `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### 3. Customer frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`. In local dev it proxies `/api/*`
requests to `http://localhost:4000` automatically — no config needed.

### 4. Admin panel

```bash
cd admin
npm install
npm run dev
```

Runs at `http://localhost:5174`, on a different port from the customer
site so you can have both open at once. Also proxies to the backend
automatically in local dev.

## Environment variables

### `backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (defaults to 4000) |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `DATABASE_URL` | Postgres connection string |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used once, to create the first admin account |

### `frontend/.env` and `admin/.env` (only needed for production builds)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Full URL of the deployed backend, e.g. `https://your-api.onrender.com/api`. Leave unset for local dev — it falls back to the dev proxy. |

## API reference

All routes are prefixed with `/api`. Send a JWT as
`Authorization: Bearer <token>` on any route marked "auth".

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create a customer account |
| POST | `/auth/login` | — | Log in, returns a JWT |
| GET | `/auth/me` | ✓ | Current user's profile |
| GET | `/materials` | — | Public live rate board |
| POST | `/bookings` | ✓ | Book a pickup |
| GET | `/bookings` | ✓ | List the current user's bookings |
| GET | `/admin/stats` | admin | Dashboard summary numbers |
| GET | `/admin/materials` | admin | All materials |
| POST | `/admin/materials` | admin | Add a material |
| PUT | `/admin/materials/:id` | admin | Update a material |
| DELETE | `/admin/materials/:id` | admin | Delete a material |
| GET | `/admin/bookings` | admin | All bookings, every user |
| PATCH | `/admin/bookings/:id/status` | admin | Update a booking's status |
| GET | `/admin/users` | admin | Read-only user roster |

## Database schema

Three tables:

- **`users`** — `id, name, email (unique), phone, password_hash, is_admin, created_at`
- **`materials`** — `id, name (unique), rate, unit ("kg"/"pcs"), category, updated_at`
- **`bookings`** — `id, user_id → users, material_id → materials, quantity, rate_at_booking, unit_at_booking, estimated_value, address, scheduled_date, status, created_at`

`rate_at_booking` captures the rate at the moment of booking, so a later
admin rate change never retroactively alters a past booking's value.

## Deploying this yourself

See `DEPLOYMENT.md` for the full walkthrough — free Postgres (Neon/Supabase)
→ backend on Render → customer site and admin panel as two separate
Vercel projects, plus notes on why the backend can't live on Vercel
itself (serverless functions there have no persistent filesystem, so a
file-based database silently loses data — this project uses real
Postgres specifically to avoid that).

## Known limitations / possible next steps

- No in-app "change admin password" screen yet — done by editing the
  database directly for now.
- No way to promote an existing customer account to admin from the UI.
- No payment gateway integration; payouts are described as cash/UPI
  handled in person by the collector.
- Render's free tier means the API sleeps after inactivity (see the Live
  demo note above) — a paid tier or a different host removes this.
- The admin login page has no extra hardening beyond requiring valid
  credentials — keep it off any public link if this ever handles real
  user data, and consider IP allowlisting for real production use.
