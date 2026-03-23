const express = require('express');
const router = express.Router();
const services = require('../data/services');
const { getSolPrice } = require('../lib/solPrice');

router.get('/', async (req, res, next) => {
  try {
    const categories = {};
    services.forEach(s => {
      if (!categories[s.category]) categories[s.category] = [];
      categories[s.category].push(s);
    });
    const solPrice = await getSolPrice();
    res.render('index', {
      title: 'Blue Brick — Solana Development Agency',
      categories,
      services,
      solPrice,
      isHomePage: true
    });
  } catch (err) { next(err); }
});

module.exports = router;
