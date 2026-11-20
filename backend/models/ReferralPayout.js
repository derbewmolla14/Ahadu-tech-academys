const mongoose = require('mongoose');

const referralPayoutSchema = new mongoose.Schema({
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amountETB: { type: Number, required: true, min: 0.01 },
  transactionReference: { type: String, required: true, trim: true, uppercase: true, maxlength: 80 },
  note: { type: String, trim: true, maxlength: 240, default: '' },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  paidAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

referralPayoutSchema.index({ transactionReference: 1 }, { unique: true });
referralPayoutSchema.index({ beneficiary: 1, paidAt: -1 });

module.exports = mongoose.models.ReferralPayout || mongoose.model('ReferralPayout', referralPayoutSchema);
