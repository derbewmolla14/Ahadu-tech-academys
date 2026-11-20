const mongoose = require('mongoose');

const telegramBotSessionSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  mode: { type: String, enum: ['receipt'], required: true, index: true },
  startedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('TelegramBotSession', telegramBotSessionSchema);
