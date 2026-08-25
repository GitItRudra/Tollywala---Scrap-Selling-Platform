const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const ALLOWED_UNITS = ['kg', 'pcs'];
const ALLOWED_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

// ---------- dashboard ----------

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    res.json({ stats: await db.getAdminStats() });
  })
);

// ---------- materials ----------

router.get(
  '/materials',
  asyncHandler(async (req, res) => {
    res.json({ materials: await db.getMaterials() });
  })
);

router.post(
  '/materials',
  asyncHandler(async (req, res) => {
    const { name, rate, unit, category } = req.body || {};
    if (!name || rate === undefined || rate === '' || !unit || !category) {
      return res.status(400).json({ error: 'name, rate, unit and category are required' });
    }
    if (!ALLOWED_UNITS.includes(unit)) {
      return res.status(400).json({ error: `unit must be one of ${ALLOWED_UNITS.join(', ')}` });
    }
    if (Number.isNaN(Number(rate)) || Number(rate) < 0) {
      return res.status(400).json({ error: 'rate must be a non-negative number' });
    }
    const material = await db.createMaterial({ name, rate, unit, category });
    res.status(201).json({ material });
  })
);

router.put(
  '/materials/:id',
  asyncHandler(async (req, res) => {
    const { name, rate, unit, category } = req.body || {};
    if (unit && !ALLOWED_UNITS.includes(unit)) {
      return res.status(400).json({ error: `unit must be one of ${ALLOWED_UNITS.join(', ')}` });
    }
    if (rate !== undefined && rate !== '' && (Number.isNaN(Number(rate)) || Number(rate) < 0)) {
      return res.status(400).json({ error: 'rate must be a non-negative number' });
    }
    const material = await db.updateMaterial(req.params.id, { name, rate, unit, category });
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ material });
  })
);

router.delete(
  '/materials/:id',
  asyncHandler(async (req, res) => {
    const ok = await db.deleteMaterial(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Material not found' });
    res.json({ ok: true });
  })
);

// ---------- bookings ----------

router.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    res.json({ bookings: await db.getAllBookings() });
  })
);

router.patch(
  '/bookings/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` });
    }
    const booking = await db.updateBookingStatus(req.params.id, status);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  })
);

// ---------- users ----------

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    res.json({ users: await db.getAllUsers() });
  })
);

module.exports = router;
