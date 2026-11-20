const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const AppSetting = require('../models/AppSetting');
const ReferralCommission = require('../models/ReferralCommission');
const ReferralPayout = require('../models/ReferralPayout');

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
    const directIds = await User.find({ referrer: user._id }).distinct('_id');
    const seen = new Set([String(user._id), ...directIds.map((id) => String(id))]);
    let frontier = directIds;
    let indirect = 0;
    // Count every descendant from level 2 onward, not only the immediate second level.
    while (frontier.length) {
      const children = await User.find({ referrer: { $in: frontier } }).distinct('_id');
      const nextFrontier = children.filter((id) => !seen.has(String(id)));
      nextFrontier.forEach((id) => seen.add(String(id)));
      indirect += nextFrontier.length;
      frontier = nextFrontier;
    }
    const [commissions, commissionTotals, payoutHistory, payoutTotals] = await Promise.all([
      ReferralCommission.find({ beneficiary: user._id }).sort({ createdAt: -1 }).limit(100).lean(),
      ReferralCommission.aggregate([
        { $match: { beneficiary: user._id } },
        { $group: { _id: null, totalETB: { $sum: '$commissionETB' } } },
      ]),
      ReferralPayout.find({ beneficiary: user._id }).sort({ paidAt: -1 }).limit(50).lean(),
      ReferralPayout.aggregate([
        { $match: { beneficiary: user._id } },
        { $group: { _id: null, totalETB: { $sum: '$amountETB' } } },
      ]),
    ]);
    const totals = Number(commissionTotals[0]?.totalETB || 0);
    const paidOut = Number(payoutTotals[0]?.totalETB || 0);
    const remaining = Math.max(0, totals - paidOut);
    return res.json({
      referralCode: code,
      referralLink: (process.env.FRONTEND_URL || 'https://ahadu-tech-academys.vercel.app').trim().replace(/\/$/, '') + '/register?ref=' + encodeURIComponent(code),
      counts: { direct: directIds.length, indirect },
      earningsETB: Number(totals.toFixed(2)),
      paidOutETB: Number(paidOut.toFixed(2)),
      remainingBalanceETB: Number(remaining.toFixed(2)),
      commissions: commissions.map(({ transactionReference, level, paidAmountETB, commissionPercent, commissionETB, createdAt }) => ({ transactionReference, level, paidAmountETB, commissionPercent, commissionETB, createdAt })),
      payouts: payoutHistory.map(({ amountETB, transactionReference, note, paidAt }) => ({ amountETB, transactionReference, note, paidAt })),
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
    const users = await User.find({ role: { $ne: 'admin' } }).select('fullName email referralCode referrer payoutAccount createdAt').populate('referrer', 'fullName email referralCode').sort({ createdAt: -1 }).lean();
    const settings = await AppSetting.findOne({ key: 'referralCommissionRates' }).select('value').lean();
    const [commissions, earnedByUser, paidByUser] = await Promise.all([
      ReferralCommission.aggregate([{ $group: { _id: null, totalETB: { $sum: '$commissionETB' }, count: { $sum: 1 } } }]),
      ReferralCommission.aggregate([{ $group: { _id: '$beneficiary', totalETB: { $sum: '$commissionETB' } } }]),
      ReferralPayout.aggregate([{ $group: { _id: '$beneficiary', totalETB: { $sum: '$amountETB' } } }]),
    ]);
    const earnedMap = new Map(earnedByUser.map((item) => [String(item._id), Number(item.totalETB || 0)]));
    const paidMap = new Map(paidByUser.map((item) => [String(item._id), Number(item.totalETB || 0)]));
    const financials = Object.fromEntries(users.map((item) => {
      const earned = earnedMap.get(String(item._id)) || 0;
      const paidOut = paidMap.get(String(item._id)) || 0;
      return [String(item._id), { earnedETB: Number(earned.toFixed(2)), paidOutETB: Number(paidOut.toFixed(2)), remainingETB: Number(Math.max(0, earned - paidOut).toFixed(2)) }];
    }));
    return res.json({ users, financials, rates: settings?.value || { direct: 10, indirect: 5 }, totals: commissions[0] || { totalETB: 0, count: 0 } });
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


exports.recordPayout = async (req, res) => {
  const { userId } = req.params;
  const amountETB = Number(Number(req.body.amountETB).toFixed(2));
  const transactionReference = String(req.body.transactionReference || '').trim().toUpperCase().slice(0, 80);
  const note = String(req.body.note || '').trim().slice(0, 240);
  if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid learner account.' });
  if (!Number.isFinite(amountETB) || amountETB <= 0 || !transactionReference) {
    return res.status(400).json({ message: 'Enter a positive payout amount and the bank or wallet transfer reference.' });
  }

  let balanceReserved = false;
  try {
    const beneficiary = await User.findOne({ _id: userId, role: { $ne: 'admin' } }).select('_id');
    if (!beneficiary) return res.status(404).json({ message: 'Learner account not found.' });
    const earnedRows = await ReferralCommission.aggregate([
      { $match: { beneficiary: beneficiary._id } },
      { $group: { _id: null, totalETB: { $sum: '$commissionETB' } } },
    ]);
    const earnedETB = Number((earnedRows[0]?.totalETB || 0).toFixed(2));
    const reservation = await User.updateOne(
      { _id: beneficiary._id, $expr: { $lte: [{ $add: [{ $ifNull: ['$referralPaidOutETB', 0] }, amountETB] }, earnedETB] } },
      { $inc: { referralPaidOutETB: amountETB } }
    );
    if (!reservation.modifiedCount) {
      return res.status(409).json({ message: 'Payout exceeds the learner’s remaining verified commission balance. Refresh the records and try again.' });
    }
    balanceReserved = true;
    const payout = await ReferralPayout.create({
      beneficiary: beneficiary._id,
      amountETB,
      transactionReference,
      note,
      sentBy: req.user._id,
      paidAt: new Date(),
    });
    return res.status(201).json({ message: 'Payout recorded successfully.', payout: { amountETB: payout.amountETB, transactionReference: payout.transactionReference, paidAt: payout.paidAt } });
  } catch (error) {
    if (balanceReserved) await User.updateOne({ _id: userId }, { $inc: { referralPaidOutETB: -amountETB } }).catch(() => undefined);
    if (error.code === 11000) return res.status(409).json({ message: 'This payout transaction reference has already been recorded.' });
    console.error('Record referral payout error:', error);
    return res.status(500).json({ message: 'Unable to record this referral payout.' });
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
