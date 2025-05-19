module.exports = {
    name: 'menu',
    execute: async (sock, msg, args) => {
        const sender = msg.key.remoteJid;
        const ownerName = sock.user.name;
        const ownerNumber = process.env.OWNER_NUMBER;

        const menuCaption = `
╭━━━[ *RTX-DIP BOT MENU* ]━━━╮
┃ 👑 *Owner:* ${ownerName}
┃ 📞 *Number:* wa.me/${ownerNumber}

📍 *Everyone Commands*
├ ❏ .menu – Show this menu
├ ❏ .ping – Bot status
├ ❏ .setwelcome <msg>
├ ❏ .delwelcome

👥 *Group Admin Commands*
├ ❏ .antilink on/off
├ ❏ .kick @user
├ ❏ .promote @user
├ ❏ .demote @user

🛠️ *Owner Only Commands*
├ ❏ .setmode public/private
├ ❏ .bc <msg>
├ ❏ .ban @user
├ ❏ .unban @user

🔗 Join Our Channel:
https://whatsapp.com/channel/0029VbAqRYj47Xe8ENkgyD1A
╰━━━━━━━━━━━━━━━━━━━━╯
        `.trim();

        await sock.sendMessage(sender, {
            image: { url: 'https://files.catbox.moe/z63f4j.jpg' },
            caption: menuCaption
        });
        
        await sock.sendMessage(sender, {
            audio: {
            url: 'https://files.catbox.moe/gbecje.mp4'
        },
        mimetype: 'audio/mp4'
        });
    }
}