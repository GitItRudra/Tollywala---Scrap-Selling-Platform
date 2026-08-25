require('dotenv').config();
const express = require('express');
const cors = require('cors');

const db = require('./db');
const authRoutes = require('./routes/auth');
const materialRoutes = require('./routes/materials');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

if (!process.env.JWT_SECRET) {
  console.warn(
    '[warning] JWT_SECRET is not set. Copy .env.example to .env and set a real secret before deploying.'
  );
  process.env.JWT_SECRET = 'dev-only-insecure-secret';
}

if (!process.env.DATABASE_URL) {
  console.error(
    '[fatal] DATABASE_URL is not set. Copy .env.example to .env and point it at a Postgres database ' +
    '(a free one from Neon or Supabase works fine) before starting the server.'
  );
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 4000;

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Tollywala API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[fatal] Could not set up the database:', err.message);
    process.exit(1);
  });
