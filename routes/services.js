const express = require('express');
const router = express.Router();
const services = require('../data/services');
const { getSolPrice, usdToSol } = require('../lib/solPrice');

// List (redirect to homepage#services)
router.get('/', (req, res) => {
  res.redirect('/#services');
});

// Individual service page
router.get('/:id', async (req, res, next) => {
  try {
    const service = services.find(s => s.id === req.params.id);
    if (!service) {
      return res.status(404).render('error', {
        title: '404 — Service Not Found | Blue Brick',
        code: '404',
        message: 'Service not found.',
        sub: 'This service does not exist. Browse our full catalogue below.',
        back: '/#services'
      });
    }

    const solPrice = await getSolPrice();
    const solCost = usdToSol(service.price, solPrice);

    // Related services (same category, exclude self)
    const related = services
      .filter(s => s.category === service.category && s.id !== service.id)
      .slice(0, 3);

    res.render('service', {
      title: `${service.name} — Blue Brick`,
      service,
      solPrice,
      solCost,
      related
    });
  } catch (err) { next(err); }
});

module.exports = router;
