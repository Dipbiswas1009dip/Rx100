const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });


module.exports = {
    name: "info",
    execute: async (sock, msg, args) => {
        const sender = msg.key.remoteJid.replace('@s.whatsapp.net', '');
        const ownerNumber = process.env.OWNER_NUMBER; // 🔹 এখানে আপনার Owner নম্বর দিন

        if (!args[0]) {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Usage: .info <whatsapp-number>" });
        }

        let number = args[0].replace(/[^0-9]/g, '');
        if (number.length < 10) {
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ Invalid phone number!" });
        }

        let jid = number + "@s.whatsapp.net";

        try {
            let ppUrl = await sock.profilePictureUrl(jid, 'image');
            if (!ppUrl) throw new Error("No profile picture found!");

            let filePath = path.join(__dirname, `${number}.jpg`);
            const response = await fetch(ppUrl);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));

            await sock.sendMessage(msg.key.remoteJid, { text: `✅ Profile Picture Downloaded!\n📞 *Number:* +${number}` });
            await sock.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: filePath }, caption: `📥 *New Profile Picture*\n📞 *Number:* +${number}\n👤 Requested by: +${sender}` });

            fs.unlinkSync(filePath); // ✅ Temp file delete
        } catch (error) {
            sock.sendMessage(msg.key.remoteJid, { text: "❌ Couldn't fetch profile picture!" });
        }
    }
};