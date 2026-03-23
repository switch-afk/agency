require('dotenv').config();
const fetch = require('node-fetch');

let cachedPrice = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getSolPrice() {
  const now = Date.now();
  if (cachedPrice && (now - lastFetch) < CACHE_TTL) {
    return cachedPrice;
  }

  // Try Jupiter price API first (no key needed, fast)
  try {
    const res = await fetch(
      'https://price.jup.ag/v6/price?ids=So11111111111111111111111111111111111111112',
      { timeout: 5000 }
    );
    if (res.ok) {
      const data = await res.json();
      const price = data?.data?.['So11111111111111111111111111111111111111112']?.price;
      if (price) {
        cachedPrice = parseFloat(price);
        lastFetch = now;
        return cachedPrice;
      }
    }
  } catch (e) { /* fallthrough */ }

  // Fallback: CoinGecko public API
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      { timeout: 5000 }
    );
    if (res.ok) {
      const data = await res.json();
      const price = data?.solana?.usd;
      if (price) {
        cachedPrice = parseFloat(price);
        lastFetch = now;
        return cachedPrice;
      }
    }
  } catch (e) { /* fallthrough */ }

  // Last resort: return last known or 0
  return cachedPrice || 0;
}

function usdToSol(usd, price) {
  if (!price || price === 0) return null;
  return (usd / price).toFixed(4);
}

module.exports = { getSolPrice, usdToSol };
