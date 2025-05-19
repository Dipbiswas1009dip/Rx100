module.exports = {
    name: '!kick',
    description: 'Kick a member (admin only)',
    async execute(sock, msg, args) {
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const isAdmin = groupMetadata.participants.find(p => p.id === msg.key.participant && p.admin);
        if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ You are not admin!' });

        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Mention a user to kick.' });

        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Removed ${mentioned[0].split('@')[0]}` });
    }
}