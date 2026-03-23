const services = [
  // Token & Launch
  { id: 'spl-token', category: 'Token & Launch', icon: '🪙', name: 'SPL Token Creation', description: 'Full fungible token deployment on Solana. Includes mint authority, freeze authority, metadata, and optional bonding curve setup.', price: 419, features: ['Custom tokenomics', 'Metadata upload', 'DEX listing ready', 'Mint authority config'] },
  { id: 'p-token', category: 'Token & Launch', icon: '⚡', name: 'p-Token (SIMD-0266) Launch', badge: 'NEW', description: 'Next-gen Pinocchio-based token standard. First-mover advantage on the most efficient token primitive on Solana.', price: 839, features: ['Pinocchio library', 'SIMD-0266 compliant', 'Ultra-low compute', 'Future-proof standard'] },
  { id: 'launchpad', category: 'Token & Launch', icon: '🚀', name: 'Token Launchpad', description: 'pump.fun-style launchpad with bonding curve mechanics, graduation threshold, and PumpSwap/Raydium migration support.', price: 3499, features: ['Bonding curve program', 'Auto-graduation', 'Raydium migration', 'Admin dashboard'] },
  { id: 'tokenomics', category: 'Token & Launch', icon: '📐', name: 'Tokenomics Design', description: 'Strategic supply architecture — vesting schedules, DAO allocation, emission curves, treasury design, and whitepaper-ready docs.', price: 559, features: ['Supply modeling', 'Vesting schedules', 'Emission design', 'Documentation'] },
  { id: 'token-brand', category: 'Token & Launch', icon: '🎨', name: 'Token Branding Kit', description: 'Complete visual identity for your token — logo, banner, lore doc, social media assets, and pump.fun / DexScreener profile.', price: 279, features: ['Logo + banner', 'Social kit', 'Lore document', 'DexScreener profile'] },

  // Web & App Dev
  { id: 'landing-page', category: 'Web & App Development', icon: '🖥️', name: 'Landing Page', description: 'High-converting landing pages for token projects, DAOs, and protocols. Space-grade design with wallet connect and roadmap sections.', price: 489, features: ['Mobile responsive', 'Wallet connect', 'Roadmap section', 'Custom domain ready'] },
  { id: 'dapp', category: 'Web & App Development', icon: '⚙️', name: 'dApp Development', description: 'Full-stack decentralized application on Solana. From UI to on-chain program integration with your preferred wallet adapter.', price: 2799, features: ['React/Next.js frontend', 'Anchor integration', 'Wallet adapter', 'RPC optimization'] },
  { id: 'web3-dashboard', category: 'Web & App Development', icon: '📊', name: 'Web3 Dashboard', description: 'Portfolio tracker, staking UI, governance voting interface, or analytics dashboard tailored to your protocol.', price: 1819, features: ['Real-time data', 'Multi-wallet', 'Charts & stats', 'Custom branding'] },
  { id: 'tg-discord-bot', category: 'Web & App Development', icon: '🤖', name: 'Telegram / Discord Bot', description: 'Token scanner bots, whale alert bots, paper trading bots, migration trackers. Grammy/discord.js. Deployed with PM2.', price: 699, features: ['Real-time alerts', 'DexScreener feed', 'PumpPortal WS', 'PM2 deployment'] },
  { id: 'wallet-integration', category: 'Web & App Development', icon: '👛', name: 'Wallet Integration', description: 'Phantom, Backpack, Solflare, and Torus wallet connect integration into any existing web app or platform.', price: 349, features: ['Multi-wallet support', 'Sign-in with Solana', 'Session management', 'Mobile ready'] },

  // Branding
  { id: 'brand-identity', category: 'Branding & Identity', icon: '✨', name: 'Brand Identity Design', description: 'Full visual identity system — logo suite, color palette, typography, brand guidelines, and Web3-native design language.', price: 839, features: ['Logo suite', 'Brand guide', 'Color system', 'Typography'] },
  { id: 'nft-artwork', category: 'Branding & Identity', icon: '🖼️', name: 'NFT Collection Artwork', description: 'PFP sets, 1/1 pieces, and generative art for Solana NFT launches. Trait layering and metadata generation included.', price: 1259, features: ['Generative layers', 'Trait metadata', 'IPFS upload', '1k–10k supply'] },
  { id: 'whitepaper', category: 'Branding & Identity', icon: '📄', name: 'Whitepaper & Litepaper', description: 'Professionally written whitepaper or litepaper. Covers protocol mechanics, tokenomics, roadmap, and team narrative.', price: 699, features: ['Full research', 'Tokenomics section', 'Roadmap', 'PDF formatted'] },
  { id: 'social-kit', category: 'Branding & Identity', icon: '📱', name: 'Social Media Kit', description: 'Twitter/X banners, Discord server setup with roles & channels, Telegram group branding, and post templates.', price: 279, features: ['X/Twitter assets', 'Discord setup', 'TG branding', 'Post templates'] },

  // DeFi & Protocol
  { id: 'smart-contract', category: 'DeFi & Protocol', icon: '🔗', name: 'Smart Contract Development', description: 'Custom Rust/Anchor programs on Solana — from simple escrow to complex DeFi protocols. Fully auditable code.', price: 4199, features: ['Rust/Anchor', 'Full test suite', 'Security review', 'Mainnet deploy'] },
  { id: 'dex-integration', category: 'DeFi & Protocol', icon: '🔄', name: 'DEX Integration', description: 'Raydium, Jupiter, Orca, and PumpSwap routing integration. Pool creation, liquidity management, and swap UI.', price: 2099, features: ['Jupiter aggregator', 'Raydium pools', 'Swap UI', 'Price feeds'] },
  { id: 'staking-platform', category: 'DeFi & Protocol', icon: '💎', name: 'Staking Platform', description: 'Native staking or liquid staking UI + on-chain program. Reward distribution, lock periods, and APY display.', price: 2799, features: ['On-chain program', 'Reward logic', 'UI dashboard', 'APY calculator'] },
  { id: 'payment-gateway', category: 'DeFi & Protocol', icon: '💳', name: 'Payment Gateway', description: 'SOL/USDC/SPL token checkout integration for any platform. QR code generation, webhook callbacks, and merchant dashboard.', price: 1119, features: ['SOL + USDC', 'QR checkout', 'Webhooks', 'Merchant dashboard'] },
  { id: 'yield-vault', category: 'DeFi & Protocol', icon: '🏦', name: 'Yield Vault / Auto-Compounder', description: 'Automated yield generation, staking, and compounding vault program. Kamino/Tulip integrations available.', price: 4899, features: ['Auto-compound', 'Kamino/Tulip', 'TVL dashboard', 'Strategy config'] },

  // NFT
  { id: 'nft-marketplace', category: 'NFT Services', icon: '🏪', name: 'NFT Marketplace', description: 'Full buy/sell/list marketplace on Solana. Compressed NFT support, royalty enforcement, and creator dashboard.', price: 5599, features: ['cNFT support', 'Royalties', 'Creator tools', 'Search & filter'] },
  { id: 'nft-mint', category: 'NFT Services', icon: '🍬', name: 'NFT Minting dApp', description: 'Custom mint site with Candy Machine v3. Whitelist phases, public mint, reveal mechanics, and live mint counter.', price: 1119, features: ['Candy Machine v3', 'WL phases', 'Reveal mechanics', 'Mint counter'] },
  { id: 'nft-utility', category: 'NFT Services', icon: '🔑', name: 'NFT Utility Integration', description: 'Token-gating, access passes, NFT staking programs, and holder-exclusive features wired into your dApp.', price: 1399, features: ['Token-gating', 'Access control', 'NFT staking', 'Holder rewards'] },

  // Security
  { id: 'audit', category: 'Security & Auditing', icon: '🔒', name: 'Smart Contract Audit', description: 'Comprehensive Rust/Anchor code review — logic vulnerabilities, arithmetic errors, authority checks, and reentrancy analysis.', price: 2799, features: ['Manual review', 'Automated scan', 'Report PDF', 'Fix verification'] },
  { id: 'security-testing', category: 'Security & Auditing', icon: '🛡️', name: 'Security Testing', description: 'Functional and automated QA testing for dApps. Load testing, edge cases, wallet attack vectors, and fuzzing.', price: 1119, features: ['Load testing', 'Edge cases', 'Fuzz testing', 'QA report'] },

  // Analytics
  { id: 'analytics-dashboard', category: 'Analytics & Tooling', icon: '📈', name: 'On-chain Analytics Dashboard', description: 'Wallet tracker, token metrics, holder distribution, price charts, and volume history. Custom to your token or protocol.', price: 1819, features: ['Holder stats', 'Volume charts', 'Price feeds', 'Export data'] },
  { id: 'whale-tracker', category: 'Analytics & Tooling', icon: '🐋', name: 'Copy Trade / Whale Tracker Bot', description: 'Track big wallets, auto-copy trades, and get real-time alerts on whale movements across Solana DEXs.', price: 979, features: ['Multi-wallet watch', 'Copy trade', 'DEX coverage', 'Telegram alerts'] },
  { id: 'migration-tracker', category: 'Analytics & Tooling', icon: '🔍', name: 'Migration Tracker Bot', description: 'Monitor pump.fun → Raydium/PumpSwap migrations. DexScreener paid profile detection, CTO alerts, scanner channel.', price: 559, features: ['PumpPortal WS', 'CTO detection', 'Paid profile alert', 'Discord scanner'] },

  // AI + Solana
  { id: 'ai-agent', category: 'AI + Solana', icon: '🧠', name: 'AI Agent Integration', description: 'LLM-powered bots with on-chain execution capability. Ollama/Claude API backed agents that can trade, analyze, and respond.', price: 2799, features: ['LLM backbone', 'On-chain execution', 'Natural language', 'Custom persona'] },
  { id: 'ai-trading-bot', category: 'AI + Solana', icon: '🤖', name: 'AI-powered Trading Bot', description: 'Signal detection with automated trade execution on Solana. Technical analysis + sentiment scoring + configurable risk.', price: 3499, features: ['TA signals', 'Sentiment scoring', 'Auto-execute', 'Risk config'] },
  { id: 'rwa-tokenization', category: 'AI + Solana', icon: '🌐', name: 'RWA Tokenization', badge: 'HOT', description: 'Real-World Asset tokenization on Solana using ZK Compression. Compliance-layer architecture, asset registry, and investor dashboard.', price: 6999, features: ['ZK Compression', 'Compliance layer', 'Asset registry', 'Investor dashboard'] },

  // ─── TEST SERVICES (always last) ──────────────────────────────
  {
    id: 'test-payment',
    category: 'Test Services',
    icon: '🧪',
    name: 'Test Payment ($5)',
    badge: 'TEST',
    description: 'End-to-end payment flow test. Sends exactly $5 worth of SOL to the agency wallet via QuickNode RPC, creates a real order, and triggers the Discord bot announcement with role ping.',
    price: 5,
    features: ['Real SOL transfer', 'QuickNode RPC', 'Order creation', 'Discord notify']
  },
  {
    id: 'test-free',
    category: 'Test Services',
    icon: '🆓',
    name: 'Test Free Order',
    badge: 'TEST',
    description: 'Zero-cost test order — bypasses payment entirely. Instantly creates a full order record so you can test Discord bot notifications, user dashboard tracking, admin panel status updates, and the complete order lifecycle.',
    price: 0,
    features: ['No payment needed', 'Discord bot test', 'Admin dashboard test', 'Full lifecycle test']
  }
];

module.exports = services;
