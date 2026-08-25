const express = require('express');
const db = require('../db');
const { asyncHandler } = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/materials - public live rate board
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ materials: await db.getMaterials() });
  })
);

module.exports = router;
