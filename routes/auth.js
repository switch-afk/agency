const express = require('express');
const router = express.Router();

router.post('/wallet-connect', (req, res) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== 'string' || address.length < 32 || address.length > 44) {
      return res.json({ success: false, error: 'Invalid wallet address' });
    }
    req.session.walletAddress = address;
    const isAdmin = !!(process.env.ADMIN_WALLET && address === process.env.ADMIN_WALLET);
    req.session.save((err) => {
      if (err) return res.json({ success: false, error: 'Session error' });
      res.json({ success: true, address, isAdmin });
    });
  } catch (err) {
    res.json({ success: false, error: 'Server error' });
  }
});

router.post('/wallet-disconnect', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

module.exports = router;
