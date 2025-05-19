const fs = require('fs');

module.exports = {
    name: "!welcome",
    async execute(sock, msg, args, welcomeMessages, welcomeFilePath) {
        const jid = msg.key.remoteJid;
        if (!args.length) {
            return sock.sendMessage(jid, { text: "⚠️ Use: !welcome &mention welcome to &group" });
        }

        const customMsg = args.join(" ");
        welcomeMessages[jid] = customMsg;
        fs.writeFileSync(welcomeFilePath, JSON.stringify(welcomeMessages, null, 2));
        sock.sendMessage(jid, { text: "✅ Custom welcome message set successfully!" });
    }
};