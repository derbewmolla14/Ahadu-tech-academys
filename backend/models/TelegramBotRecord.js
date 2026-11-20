const mongoose = require('mongoose');

const telegramBotRecordSchema = new mongoose.Schema({
  type: { type: String, enum: ['information', 'receipt'], required: true, index: true },
  chatId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  senderName: { type: String, trim: true, default: '' },
  text: { type: String, default: '' },
  caption: { type: String, default: '' },
  attachment: {
    type: { type: String, default: '' },
    fileId: { type: String, default: '' },
    fileName: { type: String, default: '' },
  },
  telegramMessageId: { type: Number, default: null },
}, { timestamps: true });

telegramBotRecordSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('TelegramBotRecord', telegramBotRecordSchema);
