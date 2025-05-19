require('dotenv').config();

module.exports = {
    mode: "private", // "public" বা "private" সেট করতে পারবে
    owner: [`${process.env.OWNER_NUMBER}@s.whatsapp.net`], // .env থেকে নম্বর আনবে
};