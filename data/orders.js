const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'orders.json');
const DEV_FILE = path.join(__dirname, 'developers.json');
const CHAT_FILE = path.join(__dirname, 'chats.json');

// ─── Orders ───────────────────────────────────────────────────
function load() {
  try { if (!fs.existsSync(FILE)) return []; return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return []; }
}
function save(orders) { fs.writeFileSync(FILE, JSON.stringify(orders, null, 2)); }

function getAll() { return load(); }
function getByWallet(wallet) { return load().filter(o => o.wallet === wallet); }
function getById(id) { return load().find(o => o.id === id) || null; }

function create(orderData) {
  const orders = load();
  const order = {
    id: 'BB-' + Date.now(),
    ...orderData,
    status: 'pending_payment',
    developerWallet: null,
    developerName: null,
    projectDetails: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [{ status: 'pending_payment', label: 'Order Placed', note: 'Awaiting payment confirmation', at: new Date().toISOString() }]
  };
  orders.push(order);
  save(orders);
  return order;
}

function updateStatus(id, status, note = '') {
  const orders = load();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const statusLabels = { pending_payment:'Pending Payment', paid:'Payment Confirmed', in_progress:'In Development', review:'Under Review', delivered:'Delivered', completed:'Completed', cancelled:'Cancelled' };
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  orders[idx].timeline.push({ status, label: statusLabels[status] || status, note, at: new Date().toISOString() });
  save(orders);
  return orders[idx];
}

function updateTx(id, txHash) {
  const orders = load();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  orders[idx].txHash = txHash;
  orders[idx].updatedAt = new Date().toISOString();
  save(orders);
  return orders[idx];
}

function updateProjectDetails(id, details) {
  const orders = load();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  orders[idx].projectDetails = details;
  orders[idx].updatedAt = new Date().toISOString();
  save(orders);
  return orders[idx];
}

function assignDeveloper(id, developerWallet, developerName) {
  const orders = load();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  orders[idx].developerWallet = developerWallet;
  orders[idx].developerName = developerName;
  orders[idx].updatedAt = new Date().toISOString();
  orders[idx].timeline.push({ status: orders[idx].status, label: 'Developer Assigned', note: `${developerName} assigned to this order`, at: new Date().toISOString() });
  save(orders);
  return orders[idx];
}

// ─── Developers ───────────────────────────────────────────────
function loadDevs() {
  try { if (!fs.existsSync(DEV_FILE)) return []; return JSON.parse(fs.readFileSync(DEV_FILE, 'utf8')); }
  catch { return []; }
}
function saveDevs(devs) { fs.writeFileSync(DEV_FILE, JSON.stringify(devs, null, 2)); }

function getAllDevs() { return loadDevs(); }
function getDevByWallet(wallet) { return loadDevs().find(d => d.wallet === wallet) || null; }

function addDeveloper(name, wallet) {
  const devs = loadDevs();
  const existing = devs.find(d => d.wallet === wallet);
  if (existing) { existing.name = name; saveDevs(devs); return existing; }
  const dev = { id: 'DEV-' + Date.now(), name, wallet, addedAt: new Date().toISOString() };
  devs.push(dev);
  saveDevs(devs);
  return dev;
}

function removeDeveloper(wallet) {
  const devs = loadDevs().filter(d => d.wallet !== wallet);
  saveDevs(devs);
}

// ─── Chat ─────────────────────────────────────────────────────
function loadChats() {
  try { if (!fs.existsSync(CHAT_FILE)) return {}; return JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8')); }
  catch { return {}; }
}
function saveChats(chats) { fs.writeFileSync(CHAT_FILE, JSON.stringify(chats, null, 2)); }

function getChatMessages(orderId) {
  const chats = loadChats();
  return chats[orderId] || [];
}

function addChatMessage(orderId, senderWallet, senderName, role, text, fileUrl=null, fileName=null) {
  const chats = loadChats();
  if (!chats[orderId]) chats[orderId] = [];
  const msg = {
    id: Date.now(),
    senderWallet,
    senderName,
    role, // 'client' | 'developer' | 'admin'
    text,
    fileUrl,
    fileName,
    at: new Date().toISOString()
  };
  chats[orderId].push(msg);
  saveChats(chats);
  return msg;
}

module.exports = {
  getAll, getByWallet, getById, create, updateStatus, updateTx,
  updateProjectDetails, assignDeveloper,
  getAllDevs, getDevByWallet, addDeveloper, removeDeveloper,
  getChatMessages, addChatMessage
};
