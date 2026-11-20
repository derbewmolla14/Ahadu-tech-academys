const mongoose = require('mongoose');

const telegramBotSessionSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  mode: {
    type: String,
    enum: ['receipt', 'menu', 'login', 'register', 'otp', 'information', 'email', 'idle'],
    default: 'idle',
    index: true,
  },
  startedAt: { type: Date, default: Date.now },
  activeViewMessageIds: { type: [Number], default: [] },
  viewUpdatedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('TelegramBotSession', telegramBotSessionSchema);
