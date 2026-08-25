const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

router.use(requireAuth);

// POST /api/bookings - create a pickup booking
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { materialId, quantity, address, scheduledDate } = req.body || {};

    if (!materialId || !quantity || !address || !scheduledDate) {
      return res
        .status(400)
        .json({ error: 'materialId, quantity, address and scheduledDate are required' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be greater than 0' });
    }

    const material = await db.getMaterialById(materialId);
    if (!material) {
      return res.status(404).json({ error: 'Unknown material' });
    }

    const estimatedValue = Math.round(material.rate * quantity * 100) / 100;

    const booking = await db.createBooking({
      user_id: req.user.id,
      material_id: material.id,
      quantity,
      rate_at_booking: material.rate,
      unit_at_booking: material.unit,
      estimated_value: estimatedValue,
      address,
      scheduled_date: scheduledDate,
    });

    res.status(201).json({ booking: { ...booking, material_name: material.name } });
  })
);

// GET /api/bookings - list the current user's bookings
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ bookings: await db.getBookingsByUser(req.user.id) });
  })
);

module.exports = router;
