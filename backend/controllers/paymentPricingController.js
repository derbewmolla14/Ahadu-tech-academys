const PaymentPricing = require('../models/PaymentPricing');

const TIER_LABELS = {
  elementary: 'Elementary',
  highschool: 'High School',
  university: 'University / College',
  phd: 'PhD',
  general: 'General / Skills & Training',
};

const emptySettings = () => ({
  tiers: Object.entries(TIER_LABELS).map(([tier, label]) => ({ tier, label, amountETB: null })),
  paymentInstructions: {
    bankName: '', accountName: '', accountNumber: '',
    telebirrName: '', telebirrNumber: '', telegramUrl: '',
  },
});

exports.getPublicPricing = async (_req, res) => {
  try {
    const saved = await PaymentPricing.findOne({ key: 'default' }).lean();
    const defaults = emptySettings();
    const byTier = new Map((saved?.tiers || []).map((item) => [item.tier, item]));
    const tiers = defaults.tiers.map((item) => ({
      ...item,
      ...(byTier.has(item.tier) ? byTier.get(item.tier) : {}),
      label: item.label,
      amountETB: byTier.has(item.tier) ? byTier.get(item.tier).amountETB ?? null : null,
    }));
    return res.json({
      tiers,
      paymentInstructions: { ...defaults.paymentInstructions, ...(saved?.paymentInstructions || {}) },
    });
  } catch (error) {
    console.error('Public payment pricing error:', error);
    return res.status(500).json({ message: 'Unable to load payment pricing.' });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const submittedTiers = Array.isArray(req.body.tiers) ? req.body.tiers : [];
    const submittedByTier = new Map(submittedTiers.map((item) => [String(item.tier || ''), item]));
    const tiers = Object.entries(TIER_LABELS).map(([tier, label]) => {
      const raw = submittedByTier.get(tier)?.amountETB;
      if (raw === '' || raw === null || raw === undefined) return { tier, label, amountETB: null };
      const amountETB = Number(raw);
      if (!Number.isFinite(amountETB) || amountETB < 0) throw new Error('Enter a valid non-negative ETB amount or leave the field blank.');
      return { tier, label, amountETB };
    });
    const source = req.body.paymentInstructions || {};
    const paymentInstructions = {};
    for (const key of ['bankName', 'accountName', 'accountNumber', 'telebirrName', 'telebirrNumber', 'telegramUrl']) {
      paymentInstructions[key] = String(source[key] || '').trim();
    }
    const saved = await PaymentPricing.findOneAndUpdate(
      { key: 'default' },
      { $set: { tiers, paymentInstructions } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({ message: 'Pricing and payment instructions saved.', tiers: saved.tiers, paymentInstructions: saved.paymentInstructions });
  } catch (error) {
    const status = error.message?.includes('ETB amount') ? 400 : 500;
    console.error('Update payment pricing error:', error);
    return res.status(status).json({ message: error.message || 'Unable to save payment pricing.' });
  }
};

exports.getAdminPricing = exports.getPublicPricing;
