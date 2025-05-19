require('dotenv').config({ path: './config.env' });
const readline = require('readline');
const { DisconnectReason, makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const PLUGIN_FOLDER = path.join(__dirname, 'plugins');
const logger = pino({ level: "silent" });
const plugins = {};

const welcomeFilePath = path.join(__dirname, 'welcome.json');
let welcomeMessages = fs.existsSync(welcomeFilePath) ? JSON.parse(fs.readFileSync(welcomeFilePath)) : {};

// Check command access
function isCommandAllowed(sender, fromMe) {
    const mode = process.env.MODE?.toLowerCase();
    const ownerNumber = (process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (mode === 'public') return true;
    return sender === ownerNumber || fromMe === true;
}

function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function getPhoneNumber() {
  const rl = createReadlineInterface();
  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  let phoneNumber;
  while (true) {
    phoneNumber = await question(chalk.blueBright('📌 Enter your WhatsApp number with country code (e.g., 8801xxxxxxxxx): '));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber.length >= 10 && phoneNumber.length <= 15) {
      break;
    }
    console.log(chalk.redBright('❌ Invalid number! Please enter a valid number with country code (e.g., 8801xxxxxxxxx)'));
  }

  rl.close();
  return phoneNumber;
}

async function connectToWhatsApp() {
    const authFolderPath = path.join(__dirname, 'auth_info_baileys');
    if (!fs.existsSync(authFolderPath)) fs.mkdirSync(authFolderPath);

    const { state, saveCreds } = await useMultiFileAuthState(authFolderPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        markOnlineOnConnect: false,
        version,
        printQRInTerminal: false,
        auth: state,
        logger
    });

if (!fs.existsSync(authFolderPath) || fs.readdirSync(authFolderPath).length === 0) {
    const phoneNumber = await getPhoneNumber();
    console.log(chalk.yellowBright('🔄 Requesting pairing code...'));

    try {
      const pairingCode = await sock.requestPairingCode(phoneNumber);
      console.log(chalk.greenBright(`✅ Pairing Code: ${pairingCode}`));
    } catch (error) {
      console.log(chalk.redBright(`❌ Error requesting pairing code: ${error.message}`));
    }
  } else {
    console.log(chalk.greenBright('✅ Already authenticated, skipping pairing process.'));
  }


    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.bgRedBright.black(`❌ Connection closed, reconnecting: ${shouldReconnect}`));
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log(chalk.bgYellowBright.black('🗑 Removing old authentication data...'));
                if (fs.existsSync(authFolderPath)) fs.rmSync(authFolderPath, { recursive: true, force: true });
                process.exit(0);
            }
        } else if (connection === 'open') {
            console.log(chalk.bgGreenBright.black('✅ Successfully connected to WhatsApp!'));

            const adminNumber = (process.env.OWNER_NUMBER || '919907298153') + '@s.whatsapp.net';
            await sock.sendMessage(adminNumber, { text: '> *🍑 Bₒₜ ₛₜₐᵣₜₑd ₛᵤccₑₛₛfᵤₗₗy ✅🤖*' });

            loadPlugins(sock);
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;

        if (action === 'add') {
            for (const user of participants) {
                const welcomeMsg = welcomeMessages[id];
                if (!welcomeMsg) return;

                const groupMetadata = await sock.groupMetadata(id);
                const groupName = groupMetadata.subject;
                const totalMembers = groupMetadata.participants.length;
                const name = user.split("@")[0];

                let text = welcomeMsg
                    .replace(/&name/gi, name)
                    .replace(/&mention/gi, `@${name}`)
                    .replace(/&group/gi, groupName)
                    .replace(/&totalmember/gi, totalMembers);

                const ppUrl = await sock.profilePictureUrl(user, 'image').catch(() => null);
                const msgOptions = {
                    text,
                    mentions: [user]
                };

                if (ppUrl) {
                    await sock.sendMessage(id, {
                        image: { url: ppUrl },
                        caption: text,
                        mentions: [user]
                    });
                } else {
                    await sock.sendMessage(id, msgOptions);
                }
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.remoteJid) return;
        sock.sendPresenceUpdate('unavailable')

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        const sender = msg.key.participant || msg.key.remoteJid;
        console.log(`📩 New Message from ${sender}: ${text}`)
        const args = text.trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (!(command in plugins)) return;
        if (!isCommandAllowed(sender, msg.key.fromMe)) {
    console.log(chalk.yellowBright(`⚠️ Command blocked for ${sender} (Private Mode)`));
    return;
}

        try {
            await sock.sendMessage(sender, {
                react: {
                    text: '⏳',
                    key: msg.key
                }
            });

            await plugins[command].execute(sock, msg, args, welcomeMessages, welcomeFilePath);

            await sock.sendMessage(sender, {
                react: {
                    text: '✅',
                    key: msg.key
                }
            });
        } catch (err) {
            await sock.sendMessage(sender, {
                react: {
                    text: '❌',
                    key: msg.key
                }
            });

            console.log(chalk.redBright(`❌ Error executing ${command}: ${err.message}`));
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

function loadPlugins(sock) {
    if (!fs.existsSync(PLUGIN_FOLDER)) fs.mkdirSync(PLUGIN_FOLDER);

    fs.readdirSync(PLUGIN_FOLDER).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const pluginPath = path.join(PLUGIN_FOLDER, file);
                const plugin = require(pluginPath);
                plugins[plugin.name] = plugin;
                console.log(chalk.greenBright(`✅ Loaded plugin: ${file}`));
            } catch (error) {
                console.log(chalk.redBright(`❌ Failed to load plugin ${file}: ${error.message}`));
            }
        }
    });
}

connectToWhatsApp();