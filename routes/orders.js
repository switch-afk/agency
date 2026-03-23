const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const orderStore = require('../data/orders');
const { getSolPrice } = require('../lib/solPrice');

// ─── Multer: images only for chat, any file for project details ─
let uploadImage, uploadAny;
try {
  const multer = require('multer');
  const attachDir = path.join(__dirname, '../data/attachments');
  if (!fs.existsSync(attachDir)) fs.mkdirSync(attachDir, { recursive: true });

  const makeStorage = () => multer.diskStorage({
    destination: (req, file, cb) => {
      const orderDir = path.join(attachDir, req.params.id || 'misc');
      if (!fs.existsSync(orderDir)) fs.mkdirSync(orderDir, { recursive: true });
      cb(null, orderDir);
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, Date.now() + '_' + safe);
    }
  });

  // Chat: all image types
  uploadImage = multer({
    storage: makeStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      // Accept anything the browser calls an image, plus common extensions
      const byMime = file.mimetype.startsWith('image/');
      const byExt  = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|tif|avif|heic|heif|ico|jfif|pjpeg|pjp)$/i.test(file.originalname);
      const ok = byMime || byExt;
      cb(ok ? null : new Error('IMAGES_ONLY'), ok);
    }
  });

  // Project details: any file
  uploadAny = multer({
    storage: makeStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
  });
} catch (e) {
  console.warn('multer not installed — run: npm install');
}

// ─── Auth guard ────────────────────────────────────────────────
router.use((req, res, next) => {
  if (!req.session.walletAddress) return res.redirect('/?connectRequired=1');
  next();
});

// ─── Helpers ───────────────────────────────────────────────────
function canAccess(order, wallet) {
  const isAdmin = !!(process.env.ADMIN_WALLET && wallet === process.env.ADMIN_WALLET);
  const isDev   = !!(order.developerWallet && wallet === order.developerWallet);
  const isClient = order.wallet === wallet;
  return { isAdmin, isDev, isClient, allowed: isAdmin || isDev || isClient };
}

function getOrderAttachments(orderId) {
  const dir = path.join(__dirname, '../data/attachments', orderId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(fname => !fname.startsWith('.') && fname !== '.gitkeep')
    .map(fname => {
      const stat = fs.statSync(path.join(dir, fname));
      const bytes = stat.size;
      const sizeStr = bytes < 1024 ? bytes + ' B'
                    : bytes < 1048576 ? (bytes/1024).toFixed(1) + ' KB'
                    : (bytes/1048576).toFixed(1) + ' MB';
      const isImg = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|avif|heic|heif|webp)$/i.test(fname);
      return { filename: fname, name: fname.replace(/^\d+_/, ''), sizeStr, isImg };
    });
}

// ─── Order detail page ─────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.status(404).render('error', { title:'404|Blue Brick', code:'404', message:'Order not found.', sub:'', back:'/dashboard' });
    const wallet = req.session.walletAddress;
    const { isAdmin, isDev, isClient, allowed } = canAccess(order, wallet);
    if (!allowed) return res.status(403).render('error', { title:'403|Blue Brick', code:'403', message:'Access denied.', sub:'You do not have access to this order.', back:'/dashboard' });
    const messages = orderStore.getChatMessages(order.id);
    const solPrice = await getSolPrice();
    const attachments = getOrderAttachments(order.id);
    res.render('order-detail', {
      title: `Order ${order.id} — Blue Brick`,
      order, messages, isAdmin, isDev, isClient,
      walletAddress: wallet, solPrice, attachments
    });
  } catch (err) { next(err); }
});

// ─── Serve image inline (base64 — never redirects) ─────────────
// Used by chat image bubbles and attachment previews
router.get('/:id/img/:filename', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.status(404).send('Not found');
    const { allowed } = canAccess(order, req.session.walletAddress);
    if (!allowed) return res.status(403).send('Forbidden');
    const fname = path.basename(req.params.filename); // sanitize
    const filePath = path.join(__dirname, '../data/attachments', req.params.id, fname);
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
    const ext = path.extname(fname).slice(1).toLowerCase();
    const mime = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif',
                   webp:'image/webp', svg:'image/svg+xml', bmp:'image/bmp', tiff:'image/tiff',
                   tif:'image/tiff', avif:'image/avif', heic:'image/heic', heif:'image/heif',
                   ico:'image/x-icon', jfif:'image/jpeg' };
    const contentType = mime[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    // Stream directly — no redirect, no public URL
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).send('Error');
  }
});

// ─── Project details ────────────────────────────────────────────
router.post('/:id/project-details', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    if (order.wallet !== req.session.walletAddress) return res.json({ success: false, error: 'Access denied' });
    const { projectName, description } = req.body;
    if (!projectName?.trim() || !description?.trim()) return res.json({ success: false, error: 'Name and description required' });
    orderStore.updateProjectDetails(order.id, { projectName: projectName.trim(), description: description.trim(), submittedAt: new Date().toISOString() });
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ─── Upload for project details (any file) ────────────────────
router.post('/:id/upload-doc', (req, res, next) => {
  if (!uploadAny) return res.json({ success: false, error: 'File upload unavailable — run: npm install' });
  next();
}, (req, res, next) => {
  uploadAny.array('files', 20)(req, res, err => {
    if (err) return res.json({ success: false, error: err.code === 'LIMIT_FILE_SIZE' ? 'Max 20MB per file' : err.message });
    next();
  });
}, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.json({ success: false, error: 'No files received' });
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    if (order.wallet !== req.session.walletAddress) return res.json({ success: false, error: 'Access denied' });
    const saved = req.files.map(f => ({ filename: f.filename, name: f.originalname }));
    res.json({ success: true, files: saved });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ─── Upload image for chat (images only) ──────────────────────
router.post('/:id/upload-image', (req, res, next) => {
  if (!uploadImage) return res.json({ success: false, error: 'Upload unavailable — run: npm install' });
  next();
}, (req, res, next) => {
  uploadImage.single('file')(req, res, err => {
    if (err) {
      if (err.message === 'IMAGES_ONLY') return res.json({ success: false, error: 'Only images allowed in chat (PNG, JPG, GIF, WEBP, SVG)' });
      if (err.code === 'LIMIT_FILE_SIZE') return res.json({ success: false, error: 'Max 10MB per image' });
      return res.json({ success: false, error: err.message });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, error: 'No file' });
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    const { allowed } = canAccess(order, req.session.walletAddress);
    if (!allowed) return res.json({ success: false, error: 'Access denied' });
    res.json({ success: true, filename: req.file.filename, name: req.file.originalname });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ─── Delete attachment ─────────────────────────────────────────
router.post('/:id/attachment/:filename/delete', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    const { allowed } = canAccess(order, req.session.walletAddress);
    if (!allowed) return res.json({ success: false, error: 'Access denied' });
    const fname = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '../data/attachments', req.params.id, fname);
    if (!fs.existsSync(filePath)) return res.json({ success: false, error: 'File not found' });
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ─── Download all as ZIP (admin + dev only) ────────────────────
router.get('/:id/attachments/zip', async (req, res, next) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.status(404).send('Order not found');
    const wallet = req.session.walletAddress;
    const { isAdmin, isDev } = canAccess(order, wallet);
    if (!isAdmin && !isDev) return res.status(403).send('Access denied');
    const attachDir = path.join(__dirname, '../data/attachments', req.params.id);
    if (!fs.existsSync(attachDir) || !fs.readdirSync(attachDir).length) return res.status(404).send('No attachments');
    let archiver;
    try { archiver = require('archiver'); }
    catch(e) { return res.status(500).send('Run: npm install archiver'); }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}-attachments.zip"`);
    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', err => next(err));
    archive.pipe(res);
    // Rename files to display names when zipping
    const files = fs.readdirSync(attachDir);
    files.forEach(f => {
      const displayName = f.replace(/^\d+_/, '');
      archive.file(path.join(attachDir, f), { name: displayName });
    });
    await archive.finalize();
  } catch (err) { next(err); }
});

// ─── Chat: send message ────────────────────────────────────────
router.post('/:id/chat', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, error: 'Order not found' });
    const wallet = req.session.walletAddress;
    const { isAdmin, isDev, isClient } = canAccess(order, wallet);
    if (!isClient && !isAdmin && !isDev) return res.json({ success: false, error: 'Access denied' });
    const { text, filename, fileName } = req.body;
    if (!text?.trim() && !filename) return res.json({ success: false, error: 'Empty message' });
    const role = isAdmin ? 'admin' : isDev ? 'developer' : 'client';
    const senderName = isAdmin ? 'Blue Brick' : isDev ? (order.developerName || 'Developer') : wallet.slice(0,4) + '...' + wallet.slice(-4);
    const msg = orderStore.addChatMessage(order.id, wallet, senderName, role,
      text?.trim().slice(0, 2000) || null, filename || null, fileName || null);
    res.json({ success: true, message: msg });
  } catch (err) { res.json({ success: false, error: err.message }); }
});

// ─── Chat: poll ────────────────────────────────────────────────
router.get('/:id/chat', (req, res) => {
  try {
    const order = orderStore.getById(req.params.id);
    if (!order) return res.json({ success: false, messages: [] });
    const { allowed } = canAccess(order, req.session.walletAddress);
    if (!allowed) return res.json({ success: false, messages: [] });
    const since = parseInt(req.query.since || '0');
    res.json({ success: true, messages: orderStore.getChatMessages(order.id).filter(m => m.id > since) });
  } catch (err) { res.json({ success: false, messages: [] }); }
});

module.exports = router;
