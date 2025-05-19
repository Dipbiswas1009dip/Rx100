require('dotenv').config({ path: './config.env' }); const fs = require('fs'); const path = require('path'); const fetch = require('node-fetch'); // যদি আলাদা করে লাগার প্রয়োজন হয়

module.exports = { name: "pp", execute: async (sock, msg, args) => { const ownerNumber = process.env.OWNER_NUMBER 
const sender = msg.key.remoteJid.replace('@s.whatsapp.net', '');

// Mention বা reply ছাড়া চালু হবে না
    let targetJid;

    // যদি কেউকে mention করা হয়
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // যদি message-এ reply করা হয়
    else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        targetJid = msg.message.extendedTextMessage.contextInfo.participant;
    } else {
        return sock.sendMessage(msg.key.remoteJid, { text: "❌ কাউকে Mention করুন বা Reply দিয়ে `.pp` লিখুন!" });
    }

    try {
        let ppUrl = await sock.profilePictureUrl(targetJid, 'image');
        if (!ppUrl) throw new Error("No profile picture!");

        let number = targetJid.split('@')[0];
        let filePath = path.join(__dirname, `${number}.jpg`);

        const response = await fetch(ppUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Profile Picture Downloaded for +${number}`
        });

        await sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
            image: { url: filePath },
            caption: `🖼️ *Profile Picture Received*\n📞 *Number:* +${number}\n👤 Requested by: +${sender}`
        });

        fs.unlinkSync(filePath); // Temp file delete
    } catch (err) {
        console.log(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ প্রোফাইল পিকচার আনতে সমস্যা হচ্ছে!" });
    }
}

};