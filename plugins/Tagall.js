const chalk = require("chalk");

module.exports = {
    name: "tagall",
    execute: async (sock, msg, args) => {
        const groupId = msg.key.remoteJid;

        // ✅ শুধুমাত্র গ্রুপে কাজ করবে
        if (!groupId.endsWith('@g.us')) {
            await sock.sendMessage(groupId, { text: '❌ এই কমান্ড শুধুমাত্র গ্রুপে ব্যবহার করা যাবে!' });
            return;
        }

        try {
            console.log(chalk.yellowBright('🔍 Fetching group members...'));

            const groupMetadata = await sock.groupMetadata(groupId);
            const participants = groupMetadata.participants.map(p => p.id);

            if (participants.length === 0) {
                await sock.sendMessage(groupId, { text: "❌ গ্রুপে কোনো সদস্য পাওয়া যায়নি!" });
                return;
            }

            let tagMessage = `TAG ALL BYE RTX-DIP @919907298153 👥 **Group Members (${participants.length})**\n\n`;

            participants.forEach((id, index) => {
                tagMessage += `${index + 1}. @${id.split('@')[0]}\n`;
            });

            await sock.sendMessage(groupId, {
                text: tagMessage,
                mentions: participants
            });

            console.log(chalk.blueBright(`✅ Tagged ${participants.length} members in group ${groupId}`));
        } catch (error) {
            console.error(chalk.red('❌ Error fetching group metadata:'), error);
            await sock.sendMessage(groupId, { text: '❌ গ্রুপের তথ্য আনতে সমস্যা হয়েছে!' });
        }
    }
};