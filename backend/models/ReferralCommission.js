const mongoose = require('mongoose');

const referralCommissionSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction', required: true },
  transactionReference: { type: String, required: true, uppercase: true, index: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  level: { type: Number, required: true, enum: [1, 2] },
  paidAmountETB: { type: Number, required: true, min: 0 },
  commissionPercent: { type: Number, required: true, min: 0, max: 100 },
  commissionETB: { type: Number, required: true, min: 0 },
}, { timestamps: true });

referralCommissionSchema.index({ payment: 1, level: 1 }, { unique: true });
module.exports = mongoose.models.ReferralCommission || mongoose.model('ReferralCommission', referralCommissionSchema);
