require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

let client = null;
let ready = false;

function init() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || token === 'your-bot-token-here') {
    console.log('⚠️  Discord bot token not set — notifications disabled');
    return;
  }

  client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', () => {
    ready = true;
    console.log(`🤖 Discord bot ready as ${client.user.tag}`);
  });

  client.on('error', err => {
    console.error('Discord bot error:', err.message);
  });

  client.login(token).catch(err => {
    console.error('Discord login failed:', err.message);
    client = null;
  });
}

async function announceOrder(order) {
  if (!client || !ready) return;

  const channelId = process.env.DISCORD_CHANNEL_ID;
  const roleId = process.env.DISCORD_NOTIFY_ROLE;

  if (!channelId || channelId === 'your-channel-id-here') return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const itemsList = order.items.map(i => `• **${i.name}** — $${i.price}`).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x1a6fff)
      .setTitle('🧱 New Order Received')
      .setDescription(`Order **${order.id}** has been placed.`)
      .addFields(
        { name: '👛 Wallet', value: `\`${order.wallet}\``, inline: false },
        { name: '📦 Services', value: itemsList || 'N/A', inline: false },
        { name: '💰 Total', value: `$${order.totalUSD} USD (~${order.totalSOL} SOL)`, inline: true },
        { name: '📅 Placed', value: new Date(order.createdAt).toUTCString(), inline: true },
        { name: '🔗 Tx Hash', value: order.txHash ? `\`${order.txHash}\`` : 'Pending', inline: false }
      )
      .setFooter({ text: 'Blue Brick Agency · Solana' })
      .setTimestamp();

    const mention = roleId && roleId !== 'your-role-id-here' ? `<@&${roleId}> ` : '';
    await channel.send({ content: `${mention}📬 New order incoming!`, embeds: [embed] });

  } catch (err) {
    console.error('Discord announce error:', err.message);
  }
}

async function announceStatusUpdate(order) {
  if (!client || !ready) return;

  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!channelId || channelId === 'your-channel-id-here') return;

  const statusColors = {
    paid: 0x00ff88,
    in_progress: 0xffaa00,
    review: 0x8800ff,
    delivered: 0x00ccff,
    completed: 0x00ff44,
    cancelled: 0xff2244
  };

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const latest = order.timeline[order.timeline.length - 1];
    const embed = new EmbedBuilder()
      .setColor(statusColors[order.status] || 0x1a6fff)
      .setTitle(`📋 Order Update — ${order.id}`)
      .addFields(
        { name: 'Status', value: `**${latest.label}**`, inline: true },
        { name: 'Wallet', value: `\`${order.wallet.slice(0,6)}...${order.wallet.slice(-4)}\``, inline: true },
        { name: 'Note', value: latest.note || '—', inline: false }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Discord status update error:', err.message);
  }
}

module.exports = { init, announceOrder, announceStatusUpdate };
