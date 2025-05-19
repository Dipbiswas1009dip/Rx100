const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");
const path = require("path");
const prompt = require("prompt-sync")();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['RTX-BOT', 'Chrome', '1.0.0']
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'connecting' || !!qr) {
      if (!fs.existsSync('./session/creds.json')) {
        const phoneNumber = prompt("Enter your WhatsApp phone number (with country code): ");
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          console.log(`Your WhatsApp Pairing Code: ${code}`);
        } catch (err) {
          console.error("Error generating pairing code:", err);
        }
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log("✅ Bot Connected!");
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Load plugins
  const plugins = {};
  const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'));
  for (const file of pluginFiles) {
    const cmd = require(`./plugins/${file}`);
    plugins[cmd.name] = cmd;
  }

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const command = body.trim().toLowerCase().split(" ")[0];

    // Auto react
    await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

    if (plugins[command]) {
      try {
        await plugins[command].run(sock, m, body);
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
      } catch (err) {
        console.error(err);
        await sock.sendMessage(from, { text: "❌ Command error!" });
      }
    }
  });
}

startBot();