const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data', 'messageCount.json');

// মেসেজ কাউন্ট লোড করা
function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    }
    return {};
}

// মেসেজ কাউন্ট সেভ করা
function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

// ইনক্রিমেন্ট ফাংশন (গ্রুপে কারা কথা বলছে গোনার জন্য)
function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) messageCounts[groupId] = {};
    if (!messageCounts[groupId][userId]) messageCounts[groupId][userId] = 0;

    messageCounts[groupId][userId] += 1;
    saveMessageCounts(messageCounts);
}

module.exports = {
    name: "top",
    description: "Shows top 5 active members in the group.",
    execute: async (sock, msg, args) => {
        const chatId = msg.key.remoteJid;

        // গ্রুপ কিনা চেক
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { text: '❌ এই কমান্ডটি শুধুমাত্র গ্রুপে কাজ করবে।' });
            return;
        }

        const messageCounts = loadMessageCounts();
        const groupCounts = messageCounts[chatId] || {};
        const topN = parseInt(args[0]) || 5;

        const sortedMembers = Object.entries(groupCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topN);

        if (sortedMembers.length === 0) {
            await sock.sendMessage(chatId, { text: 'কোনো ইউজারের মেসেজ হিসাব পাওয়া যায়নি।' });
            return;
        }

        let response = `🏆 *সক্রিয় সদস্যদের তালিকা (${topN} জন):*\n\n`;
        sortedMembers.forEach(([userId, count], index) => {
            response += `${index + 1}. @${userId.split('@')[0]} - ${count} বার মেসেজ করেছে\n`;
        });

        await sock.sendMessage(chatId, {
            text: response,
            mentions: sortedMembers.map(([userId]) => userId)
        });
    },

    // এই অংশটি event হ্যান্ডলার হিসেবে ব্যবহার হবে (message এলেই কাউন্ট বাড়াবে)
    onMessage: (msg) => {
        const chatId = msg.key.remoteJid;
        const senderId = msg.key.participant || msg.key.remoteJid;

        if (chatId.endsWith('@g.us') && senderId) {
            incrementMessageCount(chatId, senderId);
        }
    }
};