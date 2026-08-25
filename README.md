# Tollywala — Scrap Selling Platform

A full-stack app for booking doorstep scrap pickups: a live rate calculator,
user accounts, and a dashboard to track bookings.

- **Backend:** Node.js + Express, JWT auth, data stored in a plain JSON
  file (`backend/data.json`) via a tiny hand-written store in `db.js` —
  no native modules to compile, so it installs cleanly on any OS
- **Frontend:** React (Vite), no UI framework — hand-styled to match the
  design (charcoal / safety-yellow / rust industrial look)

## Project structure

```
scrapyard-app/
  backend/     Express API + SQLite database
  frontend/    React (Vite) single-page app
```

## 1. Run the backend

```bash
cd backend
npm install
cp .env.example .env      # then edit JWT_SECRET to a long random string
npm start                 # http://localhost:4000
```

On first run it creates `backend/data.json` and seeds it with starting
scrap rates. No external database server, and nothing to compile — every
dependency is pure JavaScript.

### API endpoints

| Method | Path                | Auth | Description                        |
|--------|---------------------|------|-------------------------------------|
| POST   | `/api/auth/register` | no  | Create an account, returns a JWT   |
| POST   | `/api/auth/login`    | no  | Log in, returns a JWT              |
| GET    | `/api/auth/me`       | yes | Current user's profile             |
| GET    | `/api/materials`     | no  | Live rate board                    |
| POST   | `/api/bookings`      | yes | Create a pickup booking            |
| GET    | `/api/bookings`      | yes | List the current user's bookings   |

Send the JWT as `Authorization: Bearer <token>` on authenticated routes.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:4000`
(see `frontend/vite.config.js`), so keep the backend running alongside it.

## 3. Try it out

1. Open http://localhost:5173
2. Pick a material and weight in the calculator — the payout updates live
   from the rates stored in the database.
3. Click **"Book a pickup for this estimate"** — you'll be asked to log in
   or create an account first.
4. After booking, visit **Dashboard** to see your pickup history.

## Notes for going to production

- Set a strong, random `JWT_SECRET` in `.env` — never use the example value.
- The JSON file store in `db.js` is fine for a demo or small internal tool,
  but it isn't safe for concurrent writes at real traffic — swap in a real
  database (Postgres, MySQL, or SQLite via `better-sqlite3` if your OS has a
  C++ build toolchain) before going live. Every other file (`routes/*.js`)
  only talks to `db.js`'s functions, so that's the one file to rewrite.
- Add HTTPS, rate limiting, and input validation middleware (e.g. `zod` or
  `joi`) before exposing this publicly.
- There's currently no admin interface for editing rates — that would be a
  natural next feature (a protected `/api/admin/materials` route plus an
  admin flag on the `users` table).
- For production, run `npm run build` in `frontend/` and serve the
  `dist/` folder from a static host or from Express itself.
