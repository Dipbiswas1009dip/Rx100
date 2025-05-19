const { performance } = require('perf_hooks');

module.exports = {
    name: "ping",
    execute(sock, msg, args) {
        const start = performance.now(); // শুরুতে টাইম স্ট্যাম্প নিচ্ছি
        
        sock.sendMessage(msg.key.remoteJid, { text: "> *⚡ℙ𝕚𝕟𝕘𝕚𝕟𝕘...⚡*" }).then(() => {
            const end = performance.now(); // মেসেজ পাঠানোর পরে টাইম স্ট্যাম্প নিচ্ছি
            const pingTime = (end - start).toFixed(2); // মিলিসেকেন্ডে সময় বের করছি
            
            sock.sendMessage(msg.key.remoteJid, { text: `> *⚡ℝ𝕋𝕏-𝔻𝕀ℙ 𝔹𝕆𝕋 ℙ𝕀ℕ𝔾 𝕀𝕊: ${pingTime} 𝕄𝕊⚡💫*` });
        });
    }
};