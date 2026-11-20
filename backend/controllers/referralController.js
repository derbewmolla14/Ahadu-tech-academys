const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const AppSetting = require('../models/AppSetting');
const ReferralCommission = require('../models/ReferralCommission');

async function ensureReferralCode(user) {
  if (user.referralCode) return user.referralCode;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    try {
      user.referralCode = code;
      await user.save();
      return code;
    } catch (error) {
      if (error.code !== 11000) throw error;
      user.referralCode = undefined;
    }
  }
  throw new Error('Unable to create a referral code.');
}

exports.getMine = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    const code = await ensureReferralCode(user);
    const [direct, indirect, commissions] = await Promise.all([
      User.countDocuments({ referrer: user._id }),
      User.countDocuments({ referrer: { $in: await User.find({ referrer: user._id }).distinct('_id') } }),
      ReferralCommission.find({ beneficiary: user._id }).sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    const totals = commissions.reduce((sum, item) => sum + Number(item.commissionETB || 0), 0);
    return res.json({
      referralCode: code,
      referralLink: (process.env.FRONTEND_URL || '').replace(/\/$/, '') + '/register?ref=' + encodeURIComponent(code),
      counts: { direct, indirect },
      earningsETB: Number(totals.toFixed(2)),
      commissions: commissions.map(({ transactionReference, level, paidAmountETB, commissionPercent, commissionETB, createdAt }) => ({ transactionReference, level, paidAmountETB, commissionPercent, commissionETB, createdAt })),
      payoutAccount: user.payoutAccount || {},
    });
  } catch (error) {
    console.error('Referral dashboard error:', error);
    return res.status(500).json({ message: 'Unable to load referral information.' });
  }
};

exports.updatePayout = async (req, res) => {
  try {
    const provider = String(req.body.provider || '').trim().slice(0, 60);
    const accountName = String(req.body.accountName || '').trim().slice(0, 120);
    const accountNumber = String(req.body.accountNumber || '').trim().slice(0, 80);
    if (!provider || !accountName || !accountNumber) return res.status(400).json({ message: 'Provider, account name, and account number are required.' });
    await User.findByIdAndUpdate(req.user._id, { $set: { payoutAccount: { provider, accountName, accountNumber } } }, { runValidators: true });
    return res.json({ message: 'Payout account saved.' });
  } catch (error) {
    console.error('Save payout account error:', error);
    return res.status(500).json({ message: 'Unable to save payout account.' });
  }
};

exports.getAdminOverview = async (_req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('fullName email referralCode referrer createdAt').populate('referrer', 'fullName email referralCode').sort({ createdAt: -1 }).lean();
    const settings = await AppSetting.findOne({ key: 'referralCommissionRates' }).select('value').lean();
    const commissions = await ReferralCommission.aggregate([{ $group: { _id: null, totalETB: { $sum: '$commissionETB' }, count: { $sum: 1 } } }]);
    return res.json({ users, rates: settings?.value || { direct: 10, indirect: 5 }, totals: commissions[0] || { totalETB: 0, count: 0 } });
  } catch (error) {
    console.error('Admin referral overview error:', error);
    return res.status(500).json({ message: 'Unable to load referral administration.' });
  }
};

exports.assignReferrer = async (req, res) => {
  try {
    const { userId } = req.params;
    const referrerId = req.body.referrerId ? String(req.body.referrerId) : '';
    if (!mongoose.isValidObjectId(userId) || (referrerId && !mongoose.isValidObjectId(referrerId))) return res.status(400).json({ message: 'Invalid account selection.' });
    if (referrerId === userId) return res.status(400).json({ message: 'A user cannot refer themselves.' });
    const user = await User.findById(userId);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'Learner account not found.' });
    if (referrerId) {
      const referrer = await User.findById(referrerId);
      if (!referrer || referrer.role === 'admin') return res.status(400).json({ message: 'Choose a valid learner referrer.' });
      let cursor = referrer;
      const seen = new Set();
      while (cursor?.referrer) {
        const id = String(cursor._id);
        if (id === userId) return res.status(400).json({ message: 'This assignment would create a referral cycle.' });
        if (seen.has(id)) return res.status(400).json({ message: 'Existing referral chain contains a cycle.' });
        seen.add(id);
        cursor = await User.findById(cursor.referrer).select('_id referrer');
      }
      if (String(cursor?._id || '') === userId) return res.status(400).json({ message: 'This assignment would create a referral cycle.' });
    }
    user.referrer = referrerId || null;
    await user.save();
    return res.json({ message: 'Referrer attribution updated.' });
  } catch (error) {
    console.error('Assign referrer error:', error);
    return res.status(500).json({ message: 'Unable to update referral attribution.' });
  }
};

exports.updateCommissionRates = async (req, res) => {
  const direct = Number(req.body.direct);
  const indirect = Number(req.body.indirect);
  if (![direct, indirect].every((value) => Number.isFinite(value) && value >= 0 && value <= 100) || direct + indirect > 100) {
    return res.status(400).json({ message: 'Commission rates must be between 0 and 100%, and their combined total cannot exceed 100%.' });
  }
  try {
    await AppSetting.findOneAndUpdate({ key: 'referralCommissionRates' }, { $set: { value: { direct, indirect }, updatedBy: req.user._id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.json({ message: 'Referral commission rates saved.', rates: { direct, indirect } });
  } catch (error) {
    console.error('Save commission rates error:', error);
    return res.status(500).json({ message: 'Unable to save commission rates.' });
  }
};
