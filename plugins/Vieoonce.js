require('dotenv').config({ path: './config.env' });
const fs = require("fs");
const chalk = require("chalk");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
  name: "nice",
  execute: async (sock, msg, args) => {
    const groupId = msg.key.remoteJid;
    const ownerNumber = `${process.env.OWNER_NUMBER}@s.whatsapp.net` // এখানে তোমার Owner নম্বর বসাও

    try {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg || (!quotedMsg.imageMessage && !quotedMsg.videoMessage)) {
        await sock.sendMessage(groupId, { text: '❌ প্লিজ শুধু View Once ফটো বা ভিডিও তে `.vv` দিন!' });
        return;
      }

      console.log(chalk.yellowBright('🔍 Checking for View Once media...'));

      const mediaType = quotedMsg.imageMessage ? 'image' : 'video';
      const stream = await downloadContentFromMessage(quotedMsg[mediaType + 'Message'], mediaType);
      let buffer = Buffer.from([]);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer.length) {
        await sock.sendMessage(groupId, { text: '❌ মিডিয়া ডাউনলোড করা যাচ্ছে না!' });
        return;
      }

      const fileName = `view_once_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`;
      fs.writeFileSync(fileName, buffer);

      // ✅ ডাউনলোড করা মিডিয়া Owner-এ পাঠানো হবে
      await sock.sendMessage(ownerNumber, {
        [mediaType]: { url: fileName },
        caption: `🔓 *View Once মিডিয়া উদ্ধার করা হয়েছে!*`
      });

      fs.unlinkSync(fileName);
      console.log(chalk.greenBright(`✅ View Once মিডিয়া সফলভাবে ${ownerNumber} এ পাঠানো হয়েছে!`));
      await sock.sendMessage(groupId, { text: `This command only can use admin` });

    } catch (error) {
      console.error(chalk.red('❌ View Once মিডিয়া ডাউনলোড করতে সমস্যা হয়েছে!'), error);
      await sock.sendMessage(groupId, { text: '❌ মিডিয়া রিকভারি ফেইলড!' });
    }
  }
};