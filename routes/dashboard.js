const express = require('express');
const router = express.Router();
const services = require('../data/services');
const orderStore = require('../data/orders');
const { getSolPrice } = require('../lib/solPrice');

router.use((req, res, next) => {
  if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const categories = {};
    services.forEach(s => {
      if (!categories[s.category]) categories[s.category] = [];
      categories[s.category].push(s);
    });
    const orders = orderStore.getByWallet(req.session.walletAddress);
    const solPrice = await getSolPrice();
    res.render('dashboard', {
      title: 'Dashboard — Blue Brick',
      categories,
      services,
      orders,
      solPrice,
      cart: req.session.cart || []
    });
  } catch (err) { next(err); }
});

module.exports = router;
