# 🧱 Blue Brick — Solana Development Agency

A full-stack Express/EJS/Tailwind agency website with wallet auth, service catalogue, SOL payments, order tracking, project chat, file uploads, admin dashboard, developer assignments, and Discord bot notifications.

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/switch-afk/agency.git
cd agency

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (see Configuration below)

# 4. Start
npm start
# → http://localhost:3000

# Dev mode (auto-reload)
npm run dev
```

---

## Configuration (`.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `SESSION_SECRET` | Yes | Random string for session signing |
| `QUICKNODE_RPC` | Yes | QuickNode HTTP RPC endpoint (SOL price + tx handling) |
| `QUICKNODE_WSS` | No | QuickNode WebSocket endpoint (faster tx confirmation) |
| `AGENCY_WALLET` | Yes | Solana wallet that receives all payments |
| `ADMIN_WALLET` | Yes | Wallet that unlocks `/admin` panel (same as agency wallet is fine) |
| `DISCORD_BOT_TOKEN` | No | Discord bot token for order notifications |
| `DISCORD_SERVER_ID` | No | Discord server ID |
| `DISCORD_CHANNEL_ID` | No | Channel to post order announcements |
| `DISCORD_NOTIFY_ROLE` | No | Role ID to ping on new orders |

---

## Project Structure

```
.
├── app.js                     # Express entry point
├── .env                       # Your config (never commit this)
├── .env.example               # Config template
├── data/
│   ├── services.js            # All 30+ services with prices
│   ├── orders.js              # Order + developer + chat data layer
│   ├── orders.json            # Order records (auto-created, gitignored)
│   ├── chats.json             # Chat messages (auto-created, gitignored)
│   ├── developers.json        # Developer registry (auto-created, gitignored)
│   └── attachments/           # Uploaded files per order (gitignored)
│       └── BB-<orderId>/
│           └── <timestamp>_<filename>
├── lib/
│   ├── discord.js             # Discord bot — new order + status announcements
│   └── solPrice.js            # Live SOL price (Jupiter API → CoinGecko fallback)
├── routes/
│   ├── index.js               # Homepage
│   ├── services.js            # /services/:id (service detail pages)
│   ├── dashboard.js           # /dashboard (wallet-gated user dashboard)
│   ├── orders.js              # /orders/:id (order detail, chat, file uploads)
│   ├── cart.js                # /cart
│   ├── checkout.js            # /checkout (SOL payment flow)
│   ├── auth.js                # /auth/wallet-connect, /auth/wallet-disconnect
│   ├── admin.js               # /admin (admin panel — agency wallet only)
│   ├── developer.js           # /developer (dev dashboard — registered devs only)
│   └── api.js                 # /api/sol-price, /api/health
└── views/
    ├── index.ejs              # Homepage (hero, services grid, stats)
    ├── service.ejs            # Individual service detail page
    ├── dashboard.ejs          # User dashboard (orders + service browser)
    ├── order-detail.ejs       # Order page (project details, chat, attachments)
    ├── cart.ejs               # Cart page
    ├── checkout.ejs           # Checkout + SOL payment
    ├── admin.ejs              # Admin panel (orders, developer registry)
    ├── admin-order.ejs        # Redirects to /orders/:id
    ├── developer.ejs          # Developer dashboard
    ├── error.ejs              # 404 / 403 / 500 error page
    └── partials/
        ├── header.ejs         # Nav + styles + stars + SOL ticker
        └── footer.ejs         # Cart panel + wallet modal + shared JS
```

---

## User Flows

### Client Flow
1. Land on homepage → browse services
2. Click service card → service detail page with pricing in SOL
3. Connect Phantom / Backpack / Solflare wallet (top-right)
4. Add services to cart → checkout
5. Approve SOL transaction in wallet (full amount, not split)
6. **Order Confirmed** message appears in chat automatically
7. Go to dashboard → click order card → order detail page
8. Submit project details (name + description + optional file)
9. Chat with developer in real-time (4s polling)

### Admin Flow
1. Connect agency wallet → redirected to `/admin`
2. View all orders, revenue stats
3. Add developers to registry (name + Solana wallet)
4. Assign developer to order from dropdown
5. Update order status with optional note → Discord notified
6. Click any order → `/orders/:id` → chat with client

### Developer Flow
1. Admin adds developer wallet to registry in `/admin`
2. Developer connects their wallet → sees Dev Dashboard badge
3. Click Dev Dashboard → `/developer` → see assigned orders
4. Click order → chat with client + see project details

---

## Payment Flow (Solana)

```
User clicks PAY → fetch latest blockhash (QuickNode RPC)
  → build SystemProgram.transfer tx to AGENCY_WALLET
  → user signs in wallet (Phantom/Backpack/Solflare)
  → send raw tx via QuickNode RPC
  → confirm via WebSocket (QUICKNODE_WSS) or HTTP polling fallback
  → POST /checkout/confirm with { txHash, totalSOL }
  → order created in orders.json
  → "Order Confirmed" message posted to chat
  → Discord bot announces to configured channel
```

---

## File Uploads

- **Project details**: any file type, max 20MB → `/orders/:id/upload-doc`
- **Chat**: images (PNG/JPG/GIF/WEBP/SVG) + common files → `/orders/:id/upload-image`
- All files saved to `data/attachments/<orderId>/<timestamp>_<filename>`
- Served via authenticated route `/orders/:id/img/<filename>` (not publicly accessible)
- Admin/Dev can download all attachments as ZIP: `/orders/:id/attachments/zip`

---

## Deployment with PM2

```bash
npm install -g pm2
pm2 start app.js --name bluebrick
pm2 save
pm2 startup
```

---

## Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. Create New Application → Bot → copy token → paste as `DISCORD_BOT_TOKEN`
3. Enable **Server Members Intent** and **Message Content Intent**
4. Invite bot to your server with `Send Messages` + `Embed Links` permissions
5. Copy Server ID and Channel ID from Discord (right-click → Copy ID with Dev Mode on)
6. Optional: copy a Role ID to mention on new orders

---

## Adding / Editing Services

All services live in `data/services.js`. Each entry:

```js
{
  id: 'unique-slug',          // used in cart + URLs
  category: 'Category Name',  // groups services on the page
  icon: '🪙',
  name: 'Service Name',
  description: 'What you deliver',
  price: 419,                 // USD — displayed and converted to SOL at checkout
  badge: 'NEW',               // optional: 'NEW', 'HOT', 'TEST'
  features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
}
```
