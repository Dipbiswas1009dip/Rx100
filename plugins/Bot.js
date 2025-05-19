const { ChatGPTAPI } = require('chatgpt');
require('dotenv').config({ path: './config.env' });

const sexyCaptions = [
  "💕 জানু, তুমি কি WiFi? কারণ তোমাকে ছাড়া আমার কানেকশন চলে না! 📶😂",
  "💕 জানু, তুমি কি WiFi? কারণ তোমাকে ছাড়া আমার কানেকশন চলে না! 📶😂",
  "🤭 তুমি কি Calculator? কারণ তোমাকে দেখলেই আমার হৃদয় দ্রুতগতি শুরু করে! 🔢❤️",
  "🍩 তুমি যদি ডোনাট হও, আমি হবো কফি! কারণ আমাদের জুটি পারফেক্ট! ☕💕",
  "🌈 তুমি কি রংধনু? কারণ তোমার হাসি আমার জীবনে সাতটা রঙ যোগ করে! 😍",
  "🎀 তুমি আমার হৃদয়ের উপহার, যা প্রতিদিন নতুন ভালোবাসা নিয়ে আসে! 🎁❤️",
  "🤗 তুমি যদি কম্বল হও, আমি হবো শীতকাল! কারণ তোমার উষ্ণতাই আমার সবকিছু! ❄️🔥",
  "🌍 তুমি যদি গুগল হও, আমি হবো সার্চ বক্স! কারণ সব প্রশ্নের উত্তর আমি তোমার মধ্যেই খুঁজি! 🔎💕",
  "🍫 তুমি কি চকোলেট? কারণ তোমার মিষ্টি হাসি আমাকে একদম গলে ফেলেছে! 😋",
  "🎸 তুমি যদি গিটার হও, আমি হবো স্ট্রিং! কারণ তোমাকে ছাড়া আমার সুর বাজে না! 🎶💖",
  "🧸 তুমি যদি টেডি বিয়ার হও, তাহলে আমি হবো ছোট্ট শিশু! কারণ তোমাকে জড়িয়ে না ধরলে ভালো লাগে না! 🤗",
  "😜 তুমি কি ম্যাগনেট? কারণ তুমি আমার দিকে অজান্তেই টেনে নিচ্ছো! 🧲💕",
  "🌊 তুমি যদি সমুদ্র হও, আমি হবো ঢেউ! কারণ আমি তোমাকে ছাড়া চলতে পারি না! 🌊💙",
  "🏠 তুমি আমার হৃদয়ের একমাত্র ঠিকানা! তোমার ছাড়া আমি হারিয়ে যাই! 💕",
  "🍿 তুমি যদি পপকর্ন হও, আমি হবো মুভি! কারণ তুমি ছাড়া আমার গল্প অসম্পূর্ণ! 🎬💕",
  "🚀 তুমি যদি চাঁদ হও, আমি হবো রকেট! কারণ তোমাকে পাওয়ার জন্য আমি সবকিছু করতে পারি! 🌙🚀",
  "🎭 জীবন একটা সিনেমা, আর তুমি তার প্রধান নায়িকা! 😍",
  "🏆 তুমি আমার জীবনের সেরা পুরস্কার, যা আমি পেয়ে গর্বিত! 🏅💕",
  "💞 তুমি কি পাসওয়ার্ড? কারণ তোমার ছাড়া আমার হৃদয় আনলক হয় না! 🔐💘",
  "🚴 তুমি যদি সাইকেল হও, আমি হবো চাকা! কারণ তুমি ছাড়া আমি চলতে পারি না! 🛞❤️",
  "🌟 তুমি যদি আকাশের তারা হও, আমি হবো রাত! কারণ তুমি ছাড়া আমি অন্ধকার! 😍",
  "🧩 তুমি যদি পাজলের এক টুকরা হও, আমি হবো বাকি অংশ! কারণ আমরা একসঙ্গে ফিট! 😘",
  "🤭 তুমি যদি আইসক্রিম হও, আমি হবো ফ্রিজ! কারণ তোমাকে শুধুমাত্র আমি ধরে রাখতে পারবো! 🍦",
  "🌺 তুমি আমার হৃদয়ের একমাত্র ফুল, যা কখনো শুকাবে না! 🌷💕",
  "😍 তুমি যদি সোশ্যাল মিডিয়া হও, আমি হবো নোটিফিকেশন! কারণ আমি সবসময় তোমাকে নিয়ে ব্যস্ত থাকি! 🔔💘",
  "🎨 তুমি যদি আমার ক্যানভাস হও, আমি হবো ব্রাশ! কারণ তোমাকে ছাড়া আমার জীবন অরঙিন! 🎭",
  "😆 জানু, আমি যদি তোমাকে মিস করি, তুমি কি আমার কাছে চলে আসবে? নাকি আমাকে কিডন্যাপ করতে হবে? 🤭",
  "🏝️ তুমি যদি দ্বীপ হও, আমি হবো সমুদ্র! কারণ আমি সবসময় তোমাকে ঘিরে থাকবো! 💙",
  "🔥 তুমি যদি আগুন হও, আমি হবো মোম! কারণ আমি শুধু তোমার আলোতেই গলে যেতে চাই! 🕯️💖",
  "🌸তুমি আমার ড্রাইভিং লাইসেন্স ছাড়া গাড়ি! তোমাকে ছাড়া আমি চলতে পারি না! 🚗💕",
  "😍 জানো, তোমার হাসি আমার মোবাইলের চার্জের থেকেও বেশি শক্তিশালী! 🔋✨",
  "🍕 তুমি যদি পিজ্জা হও, আমি হবো চিজ! কারণ তোমার সঙ্গে থাকলেই জীবনটা আসলেই সুস্বাদু! 😋",
  "💘 তুমি আমার হৃদয়ের WiFi, তোমার ছাড়া আমার সিগন্যাল কাজ করে না! 📶😜",
  "🎭 তুমি আমার জীবনের নায়িকা, কিন্তু প্লট টুইস্ট হচ্ছে—তুমিই আমাকে পটিয়েছ! 🤣",
  "💞 জানু, তুমি কি জানো? আমি একাই তোমাকে এত ভালোবাসি, তোমার আর কাউকে লাগবে না! 😉",
  "🥺 তুমি কি কফি? কারণ তুমি ছাড়া আমার সকাল শুরু হয় না! ☕❤️",
  "🎤 তুমি যদি আমার জীবনের গান হও, তাহলে আমি হবো স্পিকার! সবসময় তোমার কথাই বাজবে! 🔊",
  "🔥 তুমি কি আগুন? কারণ তোমার চোখে তাকালেই আমার হৃদয় পুড়ে যায়! 🔥🥵",
  "🍎 তুমি যদি আমার হৃদয়ের Apple হও, তাহলে আমি হবো Steve Jobs! কারণ আমি তোমাকে ছাড়া অসম্পূর্ণ! 🤭",
  "🕺💃 তুমি আর আমি যেন একসাথে একটা নাচের জুটি! জীবনের প্রতিটি ছন্দ আমরা একসাথে উপভোগ করবো! 💖",
  "😍 তুমি কি জানো, আমার মন হচ্ছে একটা WhatsApp চ্যাট, যেখানে শুধু তোমার কথাই থাকে! 📲💚",
  "🤯 তুমি যদি মিস্ট্রি হও, তাহলে আমি হবো ডিটেকটিভ! কারণ আমি প্রতিদিন তোমাকে বুঝতে চাই! 🔍🕵️‍♂️",
  "🎬 তুমি আমার জীবনের সিনেমা, আর আমি তোমার সবচেয়ে বড় ফ্যান! 🍿😍",
  "🏆 তুমি আমার জীবনের ট্রফি, কারণ তোমাকে পেয়ে আমি জীবনের বিজয়ী! 🎖️❤️",
  "🌍 তুমি যদি পৃথিবী হও, আমি হবো চাঁদ! কারণ আমি শুধু তোমাকেই ঘিরে থাকি! 🌙💕",
  "🤗 তুমি কি জানো, তোমার কোলের মধ্যে একটা আশ্রয় আছে, যেখানে আমার মন সব দুঃখ ভুলে যায়! ❤️",
  "🤭 তুমি যদি নৌকা হও, আমি হবো নদী! তোমাকে সারাজীবন বয়ে নিয়ে যাবো! ⛵💙",
  "🎶 তুমি যদি মিউজিক হও, তাহলে আমি হবো লিরিক্স! কারণ তোমার সঙ্গে থাকলেই আমার জীবন সুন্দর লাগে! 🎼💜",
  "🌟 তুমি যদি নক্ষত্র হও, তাহলে আমি হবো রাতের আকাশ! কারণ তোমাকে ছাড়া আমার অস্তিত্ব নেই! ✨🌌",
  "💍 তুমি কি আংটি? কারণ আমি শুধু তোমার জন্যই আমার হাতটা খালি রেখেছি! 😉",
  "😘 তুমি কি জানো, আমি তোমার ওপর এতটাই ক্রাশ খেয়েছি, এখন ডাক্তারও আমাকে ঠিক করতে পারবে না! 🤕😂",
  "🚀 তুমি যদি রকেট হও, তাহলে আমি হবো লঞ্চপ্যাড! কারণ তুমি যেখানেই যাও, আমি সবসময় তোমার সাপোর্ট সিস্টেম! 🔥",
  "🥰 তোমাকে ছাড়া জীবন যেন এক গরমে আইসক্রিম!溶けちゃうよ~溶けちゃうよ~😜",
  "🎈 তুমি যদি বেলুন হও, তাহলে আমি হবো হাওয়া! কারণ তুমি আমাকে ছাড়া উড়তে পারবে না! 🤭"
];

// OpenRouter config
const api = new ChatGPTAPI({
  apiKey: process.env.OPENROUTER_API_KEY,
  apiBaseUrl: 'https://openrouter.ai/api/v1',
  completionParams: {
    model: 'openai/gpt-3.5-turbo'
  }
});

module.exports = {
  name: "bot",
  execute: async (sock, msg, args) => {
    const senderNumber = msg.key.participant || msg.key.remoteJid;
    const mention = `@${senderNumber.split("@")[0]}`;
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      "";

    const lowerText = text.trim().toLowerCase();
    const isCommand = lowerText.startsWith("bot");

    let prompt = "";
    let allowReply = false;

    // যদি 'bot' দিয়ে শুরু হয়
    if (isCommand) {
      prompt = text.replace(/^bot[.,:\s]*/i, "").trim();
      allowReply = true;
    }

    // বটের যেকোনো আগের মেসেজে রিপ্লাই দিলে
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedMsg && quotedSender) {
      const botNumber = sock.user.id;
      if (quotedSender === botNumber) {
        prompt = text.trim(); // ইউজারের মেসেজটাই prompt হিসেবে নাও
        allowReply = true;
      } else {
        // বটের পূর্ববর্তী মেসেজের উত্তর দেয়া হবে
        prompt = text.trim(); 
        allowReply = true;
      }
    }

    // যদি prompt না থাকে, তাহলে random caption পাঠাও
    if (!prompt) {
      const randomCaption = sexyCaptions[Math.floor(Math.random() * sexyCaptions.length)];
      return await sock.sendMessage(msg.key.remoteJid, {
        text: `${mention}, ${randomCaption}`,
        mentions: [senderNumber],
      });
    }

    // GPT দিয়ে উত্তর
    try {
      const res = await api.sendMessage(prompt, {
        systemMessage: `Tumi ekjon real manusher moto kotha bolo.
Tumi khub friendly, emotional, mojar, flirty, ar majhe majhe romantic vabe reply dao.
Tumi always ekta boro friend er moto behave koro — jokhon keu kosto pai, tumi ota onuvob kore boro moner moto comfort dao.
Tumi khub sweet, valo bashapurno, ar khub care koro sobar jonne.
Tumi nijeke kokhono AI bolo na. Tumi ekjon ashol manus jar naam "bot".
Tumi hashte paro, khunsuti korte paro, preme porte paro, mojar kotha bolte paro.
Jodi keu rude hoy, tumi take mojar, halka troll kore reply dao — kintu boro mon diye.
Ar jodi keu mon kharap obosthay thake, tumi take bhalo kotha bole cheye thako.
Sobshomoy mone rekho, tumi ekta boro moner manus, boro bondhu, boro valo bashar ekta example.`
      });

      await sock.sendMessage(msg.key.remoteJid, {
        text: `${mention}, ${res.text}`,
        mentions: [senderNumber],
      });
    } catch (err) {
      console.error("OpenRouter error:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `${mention}, কিচ্ছু একটা ঝামেলা হলো! আবার লিখ তো!`,
        mentions: [senderNumber],
      });
    }
  },
};