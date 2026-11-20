const mongoose = require('mongoose');

const telegramOtpSchema = new mongoose.Schema(
  {
    purpose: { type: String, enum: ['link', 'password-reset'], required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    chatId: { type: String, default: null },
    otpHash: { type: String, required: true },
    slotNumber: { type: Number, default: null, index: true },
    verified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0, min: 0 },
    used: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

telegramOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TelegramOtp', telegramOtpSchema);
