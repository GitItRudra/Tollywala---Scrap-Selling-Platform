const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false }, // most free Postgres hosts (Neon, Supabase, Render) require SSL
});

const MATERIAL_SEED = [
  { name: 'Newspaper', rate: 10, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Carton', rate: 10, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Books', rate: 9, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Grey Board', rate: 2, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Copy', rate: 8, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Magazines', rate: 8, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Record Paper', rate: 8, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'White Paper', rate: 2, unit: 'kg', category: 'Paper & cardboard' },
  { name: 'Used Beverage Carton', rate: 5, unit: 'kg', category: 'Paper & cardboard' },

  { name: 'Mix Plastic', rate: 6, unit: 'kg', category: 'Plastic' },
  { name: 'Soft Plastic', rate: 10, unit: 'kg', category: 'Plastic' },
  { name: 'Hard Plastic', rate: 2, unit: 'kg', category: 'Plastic' },
  { name: 'Plastic Jar (15 Litre)', rate: 10, unit: 'pcs', category: 'Plastic' },
  { name: 'Polythene Bags (LD)', rate: 6, unit: 'pcs', category: 'Plastic' },
  { name: 'Plastic (PP) Bags', rate: 3, unit: 'kg', category: 'Plastic' },
  { name: 'PET Bottle', rate: 15, unit: 'kg', category: 'Plastic' },
  { name: 'Milk Covers', rate: 2, unit: 'kg', category: 'Plastic' },

  { name: 'Iron', rate: 24, unit: 'kg', category: 'Metal' },
  { name: 'Tin', rate: 16, unit: 'kg', category: 'Metal' },
  { name: 'Aluminium', rate: 160, unit: 'kg', category: 'Metal' },
  { name: 'Steel', rate: 45, unit: 'kg', category: 'Metal' },
  { name: 'Brass', rate: 410, unit: 'kg', category: 'Metal' },
  { name: 'Copper', rate: 600, unit: 'kg', category: 'Metal' },
  { name: 'Casting Aluminium', rate: 80, unit: 'kg', category: 'Metal' },
  { name: 'Beverage Cans (Aluminium)', rate: 80, unit: 'kg', category: 'Metal' },
  { name: 'Copper Wire', rate: 20, unit: 'kg', category: 'Metal' },
  { name: 'Aluminium Wire', rate: 10, unit: 'kg', category: 'Metal' },

  { name: 'Beer/Wine Bottles', rate: 1, unit: 'kg', category: 'Glass' },
  { name: 'Glass Bottles', rate: 1, unit: 'kg', category: 'Glass' },

  { name: 'E-waste', rate: 15, unit: 'kg', category: 'E-waste & appliances' },
  { name: 'Television (LCD/LED)', rate: 50, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Television (CRT)', rate: 100, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Laptop', rate: 150, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Monitor (CRT)', rate: 150, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Monitor (LCD/LED)', rate: 50, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'CPU', rate: 150, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Printer', rate: 15, unit: 'kg', category: 'E-waste & appliances' },
  { name: 'UPS (with battery)', rate: 150, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Inverter Battery', rate: 70, unit: 'kg', category: 'E-waste & appliances' },
  { name: 'Geyser', rate: 100, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Washing machine', rate: 400, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Refrigerator (Single Door)', rate: 350, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'Refrigerator (Double Door)', rate: 500, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'AC (1 ton)', rate: 2200, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'AC (1.5 ton)', rate: 2500, unit: 'pcs', category: 'E-waste & appliances' },
  { name: 'AC (2 Ton)', rate: 2800, unit: 'pcs', category: 'E-waste & appliances' },

  { name: 'Tyre', rate: 3, unit: 'kg', category: 'Other' },
  { name: 'Fibre', rate: 5, unit: 'kg', category: 'Other' },
];

const CATEGORY_ORDER = ['Paper & cardboard', 'Plastic', 'Metal', 'Glass', 'E-waste & appliances', 'Other'];

// Creates tables if they don't exist yet. Safe to run on every boot.
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS materials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      rate NUMERIC NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      material_id INTEGER NOT NULL REFERENCES materials(id),
      quantity NUMERIC NOT NULL,
      rate_at_booking NUMERIC NOT NULL,
      unit_at_booking TEXT NOT NULL,
      estimated_value NUMERIC NOT NULL,
      address TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Inserts any seed materials that don't already exist (matched by name) --
// never overwrites a material an admin has already edited. Also creates a
// default admin account the very first time there isn't one yet.
async function seed() {
  for (const m of MATERIAL_SEED) {
    await pool.query(
      `INSERT INTO materials (name, rate, unit, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO NOTHING`,
      [m.name, m.rate, m.unit, m.category]
    );
  }

  const { rows } = await pool.query('SELECT id FROM users WHERE is_admin = TRUE LIMIT 1');
  if (rows.length === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@tollywala.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hash = bcrypt.hashSync(password, 10);
    await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, is_admin) VALUES ($1, $2, $3, $4, TRUE)`,
      ['Admin', email, null, hash]
    );
    console.log(
      `\n[seed] Created a default admin account:\n  email:    ${email}\n  password: ${password}\n  Log into the admin panel and change this password.\n`
    );
  }
}

async function init() {
  await migrate();
  await seed();
}

function materialCategorySort(a, b) {
  const diff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  return diff !== 0 ? diff : a.name.localeCompare(b.name);
}

function toNumber(row, fields) {
  const copy = { ...row };
  for (const f of fields) if (copy[f] !== null && copy[f] !== undefined) copy[f] = Number(copy[f]);
  return copy;
}

const db = {
  init,

  // ---------- materials ----------
  async getMaterials() {
    const { rows } = await pool.query('SELECT * FROM materials');
    return rows.map((r) => toNumber(r, ['rate'])).sort(materialCategorySort);
  },
  async getMaterialById(id) {
    const { rows } = await pool.query('SELECT * FROM materials WHERE id = $1', [id]);
    return rows[0] ? toNumber(rows[0], ['rate']) : null;
  },
  async createMaterial({ name, rate, unit, category }) {
    const { rows } = await pool.query(
      `INSERT INTO materials (name, rate, unit, category) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, rate, unit, category]
    );
    return toNumber(rows[0], ['rate']);
  },
  async updateMaterial(id, fields) {
    const current = await db.getMaterialById(id);
    if (!current) return null;
    const next = {
      name: fields.name || current.name,
      rate: fields.rate !== undefined && fields.rate !== '' ? Number(fields.rate) : current.rate,
      unit: fields.unit || current.unit,
      category: fields.category || current.category,
    };
    const { rows } = await pool.query(
      `UPDATE materials SET name = $1, rate = $2, unit = $3, category = $4, updated_at = now() WHERE id = $5 RETURNING *`,
      [next.name, next.rate, next.unit, next.category, id]
    );
    return toNumber(rows[0], ['rate']);
  },
  async deleteMaterial(id) {
    const { rowCount } = await pool.query('DELETE FROM materials WHERE id = $1', [id]);
    return rowCount > 0;
  },

  // ---------- users ----------
  async getUserByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },
  async getUserById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },
  async createUser({ name, email, phone, password_hash }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, is_admin) VALUES ($1, $2, $3, $4, FALSE) RETURNING *`,
      [name, email, phone || null, password_hash]
    );
    return rows[0];
  },
  async getAllUsers() {
    const { rows } = await pool.query(`
      SELECT u.*, COUNT(b.id)::int AS "bookingCount"
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      is_admin: u.is_admin,
      created_at: u.created_at,
      bookingCount: u.bookingCount,
    }));
  },

  // ---------- bookings ----------
  async createBooking({ user_id, material_id, quantity, rate_at_booking, unit_at_booking, estimated_value, address, scheduled_date }) {
    const { rows } = await pool.query(
      `INSERT INTO bookings
        (user_id, material_id, quantity, rate_at_booking, unit_at_booking, estimated_value, address, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, material_id, quantity, rate_at_booking, unit_at_booking, estimated_value, address, scheduled_date]
    );
    return toNumber(rows[0], ['quantity', 'rate_at_booking', 'estimated_value']);
  },
  async getBookingsByUser(user_id) {
    const { rows } = await pool.query(
      `SELECT b.*, m.name AS material_name
       FROM bookings b LEFT JOIN materials m ON m.id = b.material_id
       WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [user_id]
    );
    return rows.map((r) => ({
      ...toNumber(r, ['quantity', 'rate_at_booking', 'estimated_value']),
      material_name: r.material_name || 'Unknown material',
    }));
  },
  async getAllBookings() {
    const { rows } = await pool.query(`
      SELECT b.*, m.name AS material_name, u.name AS user_name, u.email AS user_email
      FROM bookings b
      LEFT JOIN materials m ON m.id = b.material_id
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY b.created_at DESC
    `);
    return rows.map((r) => ({
      ...toNumber(r, ['quantity', 'rate_at_booking', 'estimated_value']),
      material_name: r.material_name || 'Unknown material',
      user_name: r.user_name || 'Unknown user',
      user_email: r.user_email || '',
    }));
  },
  async updateBookingStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!rows[0]) return null;
    const material = await db.getMaterialById(rows[0].material_id);
    return {
      ...toNumber(rows[0], ['quantity', 'rate_at_booking', 'estimated_value']),
      material_name: material?.name || 'Unknown material',
    };
  },

  // ---------- admin dashboard ----------
  async getAdminStats() {
    const [{ rows: u }, { rows: m }, { rows: b }, { rows: p }, { rows: v }] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM users'),
      pool.query('SELECT COUNT(*)::int AS n FROM materials'),
      pool.query('SELECT COUNT(*)::int AS n FROM bookings'),
      pool.query("SELECT COUNT(*)::int AS n FROM bookings WHERE status = 'pending'"),
      pool.query('SELECT COALESCE(SUM(estimated_value), 0) AS total FROM bookings'),
    ]);
    return {
      totalUsers: u[0].n,
      totalMaterials: m[0].n,
      totalBookings: b[0].n,
      pendingBookings: p[0].n,
      totalEstimatedValue: Number(v[0].total),
    };
  },
};

module.exports = db;
