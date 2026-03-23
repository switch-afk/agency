const express = require('express');
const router = express.Router();
const { getSolPrice } = require('../lib/solPrice');

router.get('/sol-price', async (req, res) => {
  try {
    const price = await getSolPrice();
    res.json({ success: true, price });
  } catch (err) {
    res.json({ success: false, price: 0 });
  }
});

router.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

module.exports = router;
