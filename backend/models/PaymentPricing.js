const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  tier: { type: String, enum: ['elementary', 'highschool', 'university', 'phd', 'general'], required: true },
  label: { type: String, required: true },
  amountETB: { type: Number, default: null, min: 0 },
}, { _id: false });

const paymentPricingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  tiers: { type: [tierSchema], default: [] },
  paymentInstructions: {
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    telebirrName: { type: String, default: '' },
    telebirrNumber: { type: String, default: '' },
    telegramUrl: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.models.PaymentPricing || mongoose.model('PaymentPricing', paymentPricingSchema);
