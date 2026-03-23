require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const discord = require('./lib/discord');

const app = express();
const PORT = process.env.PORT || 3000;

discord.init();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'bluebrick-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const orderStore = require('./data/orders');

app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  res.locals.cartCount = req.session.cart.length;
  res.locals.walletAddress = req.session.walletAddress || null;
  res.locals.isAdmin = !!(req.session.walletAddress && process.env.ADMIN_WALLET && req.session.walletAddress === process.env.ADMIN_WALLET);
  res.locals.isDeveloper = !!(req.session.walletAddress && orderStore.getDevByWallet(req.session.walletAddress));
  res.locals.solPrice = null;
  next();
});

app.use('/', require('./routes/index'));
app.use('/services', require('./routes/services'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/orders', require('./routes/orders'));
app.use('/cart', require('./routes/cart'));
app.use('/checkout', require('./routes/checkout'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/developer', require('./routes/developer'));
app.use('/api', require('./routes/api'));

app.use((req, res) => {
  res.status(404).render('error', { title:'404 — Not Found | Blue Brick', code:'404', message:'This page drifted into deep space.', sub:"The route you're looking for doesn't exist.", back:'/' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('error', { title:'500 — Server Error | Blue Brick', code:'500', message:'Something exploded on our end.', sub: err.message || 'Internal server error.', back:'/' });
});

app.listen(PORT, () => {
  console.log('🧱 Blue Brick → http://localhost:' + PORT);
  console.log('   RPC: ' + (process.env.QUICKNODE_RPC ? '✅' : '⚠️  Not set'));
  console.log('   Agency wallet: ' + (process.env.AGENCY_WALLET || '⚠️  Not set'));
});
