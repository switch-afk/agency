const express = require('express');
const router = express.Router();
const orderStore = require('../data/orders');
const { getSolPrice } = require('../lib/solPrice');

// Dev auth guard
router.use((req, res, next) => {
  if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
  const dev = orderStore.getDevByWallet(req.session.walletAddress);
  if (!dev) return res.status(403).render('error', { title:'403|Blue Brick', code:'403', message:'Developer access only.', sub:'Your wallet is not registered as a developer.', back:'/' });
  req.dev = dev;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const wallet = req.session.walletAddress;
    const allOrders = orderStore.getAll();
    const myOrders = allOrders.filter(o => o.developerWallet === wallet);
    const solPrice = await getSolPrice();
    res.render('developer', {
      title: 'Developer Dashboard — Blue Brick',
      dev: req.dev,
      orders: myOrders.reverse(),
      walletAddress: wallet,
      solPrice
    });
  } catch (err) { next(err); }
});

module.exports = router;
