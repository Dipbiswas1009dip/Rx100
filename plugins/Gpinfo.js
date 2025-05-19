module.exports = {
    name: '!groupinfo',
    description: 'Show group information',
    async execute(sock, msg) {
        const metadata = await sock.groupMetadata(msg.key.remoteJid);
        const info = `*Group Name:* ${metadata.subject}
*Created By:* ${metadata.owner?.split('@')[0]}
*Members:* ${metadata.participants.length}
*Description:* ${metadata.desc || 'No description'}`;

        await sock.sendMessage(msg.key.remoteJid, { text: info });
    }
}