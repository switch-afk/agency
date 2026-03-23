const express = require('express');
const router = express.Router();
const services = require('../data/services');
const { getSolPrice, usdToSol } = require('../lib/solPrice');

router.post('/add', (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = services.find(s => s.id === serviceId);
    if (!service) return res.json({ success: false, error: 'Service not found' });
    if (!req.session.cart) req.session.cart = [];
    const exists = req.session.cart.find(i => i.id === serviceId);
    if (!exists) {
      req.session.cart.push({ id: service.id, name: service.name, price: service.price, icon: service.icon });
    }
    req.session.save();
    res.json({ success: true, cartCount: req.session.cart.length });
  } catch (err) {
    res.json({ success: false, error: 'Server error' });
  }
});

router.post('/remove', (req, res) => {
  try {
    const { serviceId } = req.body;
    req.session.cart = (req.session.cart || []).filter(i => i.id !== serviceId);
    req.session.save();
    res.json({ success: true, cartCount: req.session.cart.length });
  } catch (err) {
    res.json({ success: false, error: 'Server error' });
  }
});

router.get('/data', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((s, i) => s + i.price, 0);
  res.json({ cart, total });
});

router.get('/', async (req, res, next) => {
  try {
    if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
    const cart = req.session.cart || [];
    const total = cart.reduce((s, i) => s + i.price, 0);
    const solPrice = await getSolPrice();
    const solTotal = usdToSol(total, solPrice);
    res.render('cart', {
      title: 'Cart — Blue Brick',
      cart, total, solPrice, solTotal,
      agencyWallet: process.env.AGENCY_WALLET || ''
    });
  } catch (err) { next(err); }
});

module.exports = router;
