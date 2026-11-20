const crypto = require('crypto');
const TelegramOtp = require('./models/TelegramOtp');
const User = require('./models/User');

const hashValue = (value) => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
let polling = false;
let offset = 0;

async function telegramRequest(method, payload = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured.');
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(method === 'getUpdates' ? 35000 : 12000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.description || 'Telegram API request failed.');
  return result.result;
}

async function handleStart(message, payload) {
  const chatId = String(message.chat.id);
  if (message.chat.type !== 'private') return;
  if (!payload) {
    await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: 'Welcome to Ahadu Tech Academy. To link your account, sign in to the academy, open Settings → Account & Profile → Link Telegram, then open the generated link and press Start.',
    });
    return;
  }

  const linkChallenge = await TelegramOtp.findOne({
    purpose: 'link',
    otpHash: hashValue(payload),
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!linkChallenge) {
    const resetChallenge = await TelegramOtp.findOne({
      purpose: 'password-reset',
      flowTokenHash: hashValue(payload),
      email: { $type: 'string' },
      used: false,
      expiresAt: { $gt: new Date() },
    });
    if (resetChallenge && String(resetChallenge.chatId) === chatId) {
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: 'Your Ahadu Tech Academy password-reset flow is open. Enter the 6-digit code already sent to this Telegram chat on the academy website before the 2-minute countdown expires.',
      });
      return;
    }
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'This account-link or password-reset request is invalid or expired. Return to Ahadu Tech Academy and start a new request.' });
    return;
  }
  const challenge = linkChallenge;
  if (!challenge) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'This account-link request is invalid or expired. Sign in to Ahadu Tech Academy and generate a new Telegram link.' });
    return;
  }

  const user = await User.findById(challenge.userId);
  if (!user || user.email !== challenge.email) {
    await TelegramOtp.updateOne({ _id: challenge._id }, { $set: { used: true } });
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'We could not complete this account link. Please generate a new link from your academy account.' });
    return;
  }

  const claimed = await TelegramOtp.findOneAndUpdate(
    { _id: challenge._id, used: false, expiresAt: { $gt: new Date() } },
    { $set: { used: true, chatId } },
    { new: true }
  );
  if (!claimed) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'This link has already been used or has expired. Generate a new link from your academy account.' });
    return;
  }

  await User.updateMany(
    { telegramChatId: chatId, _id: { $ne: user._id } },
    { $set: { telegramChatId: null, telegramUsername: '' } }
  );
  user.telegramChatId = chatId;
  user.telegramUsername = message.from?.username ? '@' + message.from.username : '';
  await user.save();
  await TelegramOtp.deleteMany({ userId: user._id, purpose: 'link' });
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: 'Your Telegram account is now securely linked to Ahadu Tech Academy. You can use Telegram OTP for password recovery.',
  });
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message?.text || !message.chat?.id) return;
  const match = message.text.trim().match(/^\/start(?:\s+([A-Za-z0-9_-]{20,128}))?$/);
  if (match) {
    await handleStart(message, match[1] || '');
    return;
  }
  if (/^\/link\b/i.test(message.text.trim())) {
    await telegramRequest('sendMessage', {
      chat_id: message.chat.id,
      text: 'For security, account linking must start while signed in to the academy: Settings → Account & Profile → Link Telegram. We never link an account using an email address sent in chat.',
    });
  }
}

async function pollLoop() {
  while (polling) {
    try {
      const updates = await telegramRequest('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] });
      for (const update of updates || []) {
        offset = Math.max(offset, update.update_id + 1);
        try {
          await handleUpdate(update);
        } catch (error) {
          console.error('[telegram bot] Update handling failed:', error.message);
        }
      }
    } catch (error) {
      console.error('[telegram bot] Polling error:', error.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function startTelegramBot() {
  if (polling || !process.env.TELEGRAM_BOT_TOKEN?.trim()) return;
  polling = true;
  console.info('[telegram bot] Starting long polling for account-link commands.');
  void pollLoop();
}

module.exports = { startTelegramBot };
