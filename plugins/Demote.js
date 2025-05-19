module.exports = {
    name: '!demote',
    description: 'Demote an admin to member (admin only)',
    async execute(sock, msg) {
        const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
        const isAdmin = groupMetadata.participants.find(p => p.id === msg.key.participant && p.admin);
        if (!isAdmin) return sock.sendMessage(msg.key.remoteJid, { text: '❌ You are not admin!' });

        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Mention a user to demote.' });

        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'demote');
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Demoted ${mentioned[0].split('@')[0]} to member.` });
    }
}