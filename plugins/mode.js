const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '..', 'config.env');

module.exports = {
    name: 'mode',
    description: 'Set bot mode (public/private)',

    execute: async (sock, msg, args) => {
        const sender = msg.key.remoteJid;
        const fromMe = msg.key.fromMe;

        if (!fromMe) {
            await sock.sendMessage(sender, { text: '❌ Only owner can change bot mode!' });
            return;
        }

        const mode = (args[0] || '').toLowerCase();
        if (!['public', 'private'].includes(mode)) {
            await sock.sendMessage(sender, {
                text: `❌ Invalid mode!\n\n✅ Available modes:\n• public\n• private\n\nExample: .mode public`
            });
            return;
        }

        // Read and update config.env
        let configContent = fs.readFileSync(configPath, 'utf-8');
        if (configContent.includes('MODE=')) {
            configContent = configContent.replace(/MODE=.*/g, `MODE=${mode}`);
        } else {
            configContent += `\nMODE=${mode}`;
        }

        fs.writeFileSync(configPath, configContent);
        process.env.MODE = mode; // Update current process env

        await sock.sendMessage(sender, {
            text: `✅ Bot mode successfully updated to *${mode.toUpperCase()}*`
        });
    }
};