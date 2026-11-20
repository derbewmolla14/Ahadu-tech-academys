const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  transactionReference: { type: String, required: true, trim: true, uppercase: true, unique: true, index: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseContent', required: true },
  amountETB: { type: Number, required: true, min: 0 },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['verified'], default: 'verified' },
}, { timestamps: true });

module.exports = mongoose.models.PaymentTransaction || mongoose.model('PaymentTransaction', paymentTransactionSchema);
