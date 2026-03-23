const express = require('express');
const router = express.Router();
const orderStore = require('../data/orders');
const discord = require('../lib/discord');
const { getSolPrice } = require('../lib/solPrice');

// Admin guard
router.use((req, res, next) => {
  if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
  if (!process.env.ADMIN_WALLET || req.session.walletAddress !== process.env.ADMIN_WALLET) {
    return res.status(403).render('error', { title:'403|Blue Brick', code:'403', message:'Admin access only.', sub:'Connect the agency wallet to access admin.', back:'/dashboard' });
  }
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const orders = orderStore.getAll().reverse();
    const devs = orderStore.getAllDevs();
    const solPrice = await getSolPrice();
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending_payment').length,
      paid: orders.filter(o => o.status === 'paid').length,
      inProgress: orders.filter(o => o.status === 'in_progress').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders.filter(o => ['paid','in_progress','review','delivered','completed'].includes(o.status))
                     .reduce((s, o) => s + (o.totalUSD || 0), 0)
    };
    res.render('admin', { title:'Admin — Blue Brick', orders, stats, solPrice, devs });
  } catch (err) { next(err); }
});

// Single order
router.get('/order/:id', async (req, res, next) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.status(404).render('error', { title:'404|Blue Brick', code:'404', message:'Order not found.', sub:'', back:'/admin' });
    const messages = orderStore.getChatMessages(order.id);
    const solPrice = await getSolPrice();
    const path = require('path');
    const fs = require('fs');
    const attachDir = path.join(__dirname, '../data/attachments', order.id);
    const attachments = fs.existsSync(attachDir) ? fs.readdirSync(attachDir).map(f => ({
      filename: f, name: f.replace(/^\d+_/,''),
      isImg: /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(f)
    })) : [];
    res.render('admin-order', { title:`Order ${order.id} — Admin`, order, messages, solPrice, attachments });
  } catch (err) { next(err); }
});

// Update order status
router.post('/order/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const valid = ['pending_payment','paid','in_progress','review','delivered','completed','cancelled'];
    if (!valid.includes(status)) return res.json({ success: false, error: 'Invalid status' });
    const order = orderStore.updateStatus(req.params.id, status, note || '');
    if (!order) return res.json({ success: false, error: 'Order not found' });
    discord.announceStatusUpdate(order).catch(() => {});
    res.json({ success: true, order });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// Assign developer
router.post('/order/:id/assign-dev', (req, res) => {
  try {
    const { developerWallet, developerName } = req.body;
    if (!developerWallet || !developerName) return res.json({ success: false, error: 'Name and wallet required' });
    const order = orderStore.assignDeveloper(req.params.id, developerWallet.trim(), developerName.trim());
    if (!order) return res.json({ success: false, error: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// Admin send chat message
router.post('/order/:id/chat', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    const { text } = req.body;
    if (!text?.trim()) return res.json({ success: false, error: 'Empty message' });
    const msg = orderStore.addChatMessage(order.id, req.session.walletAddress, 'Blue Brick', 'admin', text.trim().slice(0, 2000));
    res.json({ success: true, message: msg });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// Get chat messages for admin
router.get('/order/:id/chat', (req, res) => {
  try {
    const since = parseInt(req.query.since || '0');
    const messages = orderStore.getChatMessages(req.params.id).filter(m => m.id > since);
    res.json({ success: true, messages });
  } catch (err) { res.json({ success: false, messages: [] }); }
});

// Add developer to registry
router.post('/developers/add', (req, res) => {
  try {
    const { name, wallet } = req.body;
    if (!name || !wallet) return res.json({ success: false, error: 'Name and wallet required' });
    const dev = orderStore.addDeveloper(name.trim(), wallet.trim());
    res.json({ success: true, dev });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// Remove developer
router.post('/developers/remove', (req, res) => {
  try {
    const { wallet } = req.body;
    orderStore.removeDeveloper(wallet);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

module.exports = router;
