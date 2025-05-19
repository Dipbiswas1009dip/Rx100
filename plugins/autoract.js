const emojis = require('./data/emojis');

let autoractStatus = true; // Default সব জায়গায় চালু থাকবে

module.exports = {
    name: 'autoract',
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;

        if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
            return sock.sendMessage(chatId, { text: 'Usage: .autoract on / off' });
        }

        const status = args[0].toLowerCase() === 'on';
        autoractStatus = status;

        await sock.sendMessage(chatId, { text: `✅ Autoract is now *${status ? 'ON' : 'OFF'}* everywhere.` });
    },

    onMessage: async (sock, msg) => {
        if (!autoractStatus) return;
        if (!msg.message || msg.key.fromMe) return;

        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                react: {
                    text: randomEmoji,
                    key: msg.key
                }
            });
        } catch (err) {
            console.error('React error:', err.message);
        }
    }
};