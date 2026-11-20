const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const AppSetting = require('../models/AppSetting');

const router = express.Router();
const KEY = 'telegramBotLink';

function normalizeTelegramLink(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  const candidate = /^@?[A-Za-z0-9_]{5,32}$/.test(raw)
    ? 'https://t.me/' + raw.replace(/^@/, '')
    : raw;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' || !['t.me', 'telegram.me'].includes(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

router.get('/telegram-link', async (_req, res) => {
  const fallbackLink = normalizeTelegramLink(process.env.TELEGRAM_BOT_USERNAME) || 'https://t.me/HorizonHydroOstechbot';
  try {
    const setting = await AppSetting.findOne({ key: KEY }).select('value');
    const link = normalizeTelegramLink(setting?.value) || fallbackLink;
    return res.json({ telegramLink: link });
  } catch {
    // Keep the public bot link available even if the optional DB setting is
    // temporarily unavailable; link creation itself reports DB failures.
    return res.json({ telegramLink: fallbackLink });
  }
});

router.put('/telegram-link', auth, permit('admin'), async (req, res) => {
  const link = normalizeTelegramLink(req.body?.telegramLink);
  if (link === null) return res.status(400).json({ message: 'Enter a valid Telegram bot username or https://t.me/ link.' });
  if (!link) return res.status(400).json({ message: 'Telegram bot link is required.' });
  try {
    await AppSetting.findOneAndUpdate(
      { key: KEY },
      { $set: { value: link, updatedBy: req.user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Telegram bot link updated.', telegramLink: link });
  } catch {
    res.status(500).json({ message: 'Unable to save Telegram bot link.' });
  }
});

module.exports = router;
