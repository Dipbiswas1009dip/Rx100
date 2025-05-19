const fs = require('fs');
const path = require('path');

// Antilink সেটিংস সংরক্ষণ ফাইল
const dataPath = path.join(__dirname, 'data', 'antilink.json');

// সেভ এবং লোড ফাংশন
function loadAntilinkSettings() {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    }
    return {};
}

function saveAntilinkSettings(settings) {
    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 2));
}

function setAntilinkSetting(groupId, setting) {
    const settings = loadAntilinkSettings();
    settings[groupId] = setting;
    saveAntilinkSettings(settings);
}

function getAntilinkSetting(groupId) {
    const settings = loadAntilinkSettings();
    return settings[groupId] || 'off';
}

module.exports = {
    name: 'antilink',
    description: 'Prevent unwanted link spam in group',
    execute: async (sock, msg, args) => {
        const groupId = msg.key.remoteJid;

        const groupMetadata = await sock.groupMetadata(groupId);
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

        if (!senderAdmin) {
            await sock.sendMessage(groupId, { text: '❌ শুধুমাত্র গ্রুপ অ্যাডমিনরাই এই কমান্ডটি ব্যবহার করতে পারবেন।' });
            return;
        }

        const subCommand = args[0]?.toLowerCase();
        if (!subCommand) {
            const help = `🔒 *Antilink Commands:*
• .antilink off - বন্ধ করুন
• .antilink whatsapp - WhatsApp গ্রুপ লিংক ব্লক
• .antilink whatsappchannel - WhatsApp চ্যানেল লিংক ব্লক
• .antilink telegram - Telegram লিংক ব্লক
• .antilink all - সব ধরনের লিংক ব্লক`;
            return sock.sendMessage(groupId, { text: help });
        }

        switch (subCommand) {
            case 'off':
                setAntilinkSetting(groupId, 'off');
                await sock.sendMessage(groupId, { text: '✅ Antilink সিস্টেম বন্ধ করা হয়েছে।' });
                break;
            case 'whatsapp':
                setAntilinkSetting(groupId, 'whatsappGroup');
                await sock.sendMessage(groupId, { text: '✅ WhatsApp গ্রুপ লিংক এখন ব্লক করা হবে।' });
                break;
            case 'whatsappchannel':
                setAntilinkSetting(groupId, 'whatsappChannel');
                await sock.sendMessage(groupId, { text: '✅ WhatsApp চ্যানেল লিংক এখন ব্লক করা হবে।' });
                break;
            case 'telegram':
                setAntilinkSetting(groupId, 'telegram');
                await sock.sendMessage(groupId, { text: '✅ Telegram লিংক এখন ব্লক করা হবে।' });
                break;
            case 'all':
                setAntilinkSetting(groupId, 'allLinks');
                await sock.sendMessage(groupId, { text: '✅ সব ধরনের লিংক এখন ব্লক করা হবে।' });
                break;
            default:
                await sock.sendMessage(groupId, { text: '❌ ভুল কমান্ড। .antilink লিখে হেল্প মেসেজ দেখুন।' });
        }
    },

    // মেসেজ ইভেন্টে লিংক চেক ও মুছা
    onMessage: async (sock, msg) => {
        const groupId = msg.key.remoteJid;
        if (!groupId.endsWith('@g.us')) return;

        const setting = getAntilinkSetting(groupId);
        if (setting === 'off') return;

        const senderId = msg.key.participant || msg.key.remoteJid;
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        if (!body) return;

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/,
            telegram: /t\.me\/[A-Za-z0-9_]+/,
            allLinks: /https?:\/\/[^\s]+/,
        };

        let shouldDelete = false;

        if (
            (setting === 'whatsappGroup' && linkPatterns.whatsappGroup.test(body)) ||
            (setting === 'whatsappChannel' && linkPatterns.whatsappChannel.test(body)) ||
            (setting === 'telegram' && linkPatterns.telegram.test(body)) ||
            (setting === 'allLinks' && linkPatterns.allLinks.test(body))
        ) {
            shouldDelete = true;
        }

        if (shouldDelete) {
            try {
                await sock.sendMessage(groupId, {
                    delete: {
                        remoteJid: groupId,
                        fromMe: false,
                        id: msg.key.id,
                        participant: senderId
                    }
                });

                await sock.sendMessage(groupId, {
                    text: `⚠️ @${senderId.split('@')[0]}, গ্রুপে লিংক শেয়ার করা নিষিদ্ধ!`,
                    mentions: [senderId]
                });
            } catch (err) {
                console.error('❌ লিংক ডিলিট করতে ব্যর্থ:', err);
            }
        }
    }
};