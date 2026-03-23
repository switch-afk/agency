const express = require('express');
const router = express.Router();
const orderStore = require('../data/orders');
const { getSolPrice, usdToSol } = require('../lib/solPrice');
const discord = require('../lib/discord');

router.use((req, res, next) => {
  if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');
    const total = cart.reduce((s, i) => s + i.price, 0);
    const solPrice = await getSolPrice();
    const solTotal = total > 0 ? usdToSol(total, solPrice) : '0';
    res.render('checkout', {
      title: 'Checkout — Blue Brick',
      cart, total, solPrice, solTotal,
      agencyWallet: process.env.AGENCY_WALLET || '',
      quicknodeRpc: process.env.QUICKNODE_RPC || '',
      quicknodeWss: process.env.QUICKNODE_WSS || ''
    });
  } catch (err) { next(err); }
});

// Free order (test-free — price 0)
router.post('/confirm-free', async (req, res) => {
  try {
    const wallet = req.session.walletAddress;
    const cart = req.session.cart || [];
    if (!wallet) return res.json({ success: false, error: 'Not connected' });
    if (cart.length === 0) return res.json({ success: false, error: 'Cart is empty' });
    const totalUSD = cart.reduce((s, i) => s + i.price, 0);
    if (totalUSD !== 0) return res.json({ success: false, error: 'Not a free order' });
    const order = orderStore.create({ wallet, items: cart, totalUSD: 0, totalSOL: '0', txHash: null });
    orderStore.updateStatus(order.id, 'paid', 'Free test order — no payment required');
    orderStore.addChatMessage(order.id, process.env.ADMIN_WALLET || 'BlueBrick', 'Blue Brick', 'admin',
      '✅ Order Confirmed! Thank you for your order. Please submit your project details so we can get started. Our team will be in touch shortly.');
    discord.announceOrder(orderStore.getById(order.id)).catch(() => {});
    req.session.cart = [];
    req.session.save();
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.json({ success: false, error: 'Order creation failed' });
  }
});

// Paid order — full amount
router.post('/confirm', async (req, res) => {
  try {
    const { txHash, totalSOL } = req.body;
    const wallet = req.session.walletAddress;
    const cart = req.session.cart || [];
    if (!wallet) return res.json({ success: false, error: 'Not connected' });
    if (cart.length === 0) return res.json({ success: false, error: 'Cart is empty' });
    if (!txHash) return res.json({ success: false, error: 'No transaction hash' });
    const totalUSD = cart.reduce((s, i) => s + i.price, 0);
    const order = orderStore.create({ wallet, items: cart, totalUSD, totalSOL: totalSOL || '?', txHash });
    orderStore.updateStatus(order.id, 'paid', 'Full payment confirmed on-chain');
    orderStore.addChatMessage(order.id, process.env.ADMIN_WALLET || 'BlueBrick', 'Blue Brick', 'admin',
      '✅ Order Confirmed & Payment Received! Thank you. Please submit your project details below so we can get started. Our team will review and be in touch within 24 hours.');
    discord.announceOrder(orderStore.getById(order.id)).catch(() => {});
    req.session.cart = [];
    req.session.save();
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.json({ success: false, error: 'Order creation failed' });
  }
});

module.exports = router;
