const crypto = require('crypto');
const TelegramOtp = require('./models/TelegramOtp');
const User = require('./models/User');
const TelegramBotRecord = require('./models/TelegramBotRecord');
const TelegramBotSession = require('./models/TelegramBotSession');

const hashValue = (value) => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
let polling = false;
let offset = 0;

const BOT_MENU_KEYBOARD = { keyboard: [[{ text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true };
const ACTION_MENU_KEYBOARD = { keyboard: [[{ text: 'Login' }, { text: 'Register' }], [{ text: 'OTP Code' }], [{ text: 'Information / ኢንፎርሜሽን' }, { text: 'Email / ኢሜይል' }], [{ text: 'Send Receipt / ሴንድ ሪሲፕት' }], [{ text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true };
function academyUrl(path) { const base = String(process.env.FRONTEND_URL || 'https://ahadu-tech-academys.vercel.app').replace(/\/$/, ''); return base + path; }
async function sendMenu(chatId, showActions = false) {
  await telegramRequest('sendMessage', { chat_id: chatId, text: showActions ? 'Choose Login, Register, or OTP Code. / መግቢያ፣ ምዝገባ ወይም የOTP ኮድ ይምረጡ።' : 'Tap Menu to see options. / አማራጮቹን ለማየት ሜኑን ይጫኑ።', reply_markup: showActions ? ACTION_MENU_KEYBOARD : BOT_MENU_KEYBOARD });
}
async function sendOtpCodeForChat(chatId) {
  const user = await User.findOne({ telegramChatId: String(chatId) }).select('_id email telegramChatId');
  if (!user || !user.email) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'No academy account is linked to this Telegram chat. Sign in to Ahadu Tech Academy, open Settings → Account & Profile → Link Telegram, then press Start in the secure bot link. / ከዚህ ቴሌግራም ጋር የተገናኘ መለያ የለም። ወደ አካዳሚው ይግቡና Settings → Account & Profile → Link Telegram ይጠቀሙ።', reply_markup: BOT_MENU_KEYBOARD });
    return;
  }
  const email = String(user.email).trim().toLowerCase();
  const ttlMs = 2 * 60 * 1000;
  const slotNumber = Math.floor(Date.now() / ttlMs);
  const expiresAt = new Date((slotNumber + 1) * ttlMs);
  await TelegramOtp.updateMany({ userId: user._id, purpose: 'password-reset', used: false }, { $set: { used: true } });
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await TelegramOtp.create({ purpose: 'password-reset', userId: user._id, email, chatId: String(user.telegramChatId), otpHash: crypto.createHmac('sha256', process.env.JWT_SECRET).update(otp, 'utf8').digest('hex'), flowTokenHash: null, slotNumber, verified: false, verifiedAt: null, expiresAt });
  const seconds = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
  await telegramRequest('sendMessage', { chat_id: chatId, text: 'Ahadu Tech Academy OTP Code: ' + otp + '\nEmail: ' + email + '\nValid for ' + seconds + ' seconds (current 2-minute window). Use it on the academy password recovery page. Do not share this code. / የOTP ኮድ ለ2 ደቂቃ ይሰራል። በአካዳሚው የይለፍ ቃል መመለሻ ገጽ ይጠቀሙበት።', reply_markup: BOT_MENU_KEYBOARD });
}



async function sendInformation(chatId) {
  const records = await TelegramBotRecord.find({ type: 'information' }).sort({ createdAt: -1 }).limit(30).lean();
  if (!records.length) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'No official information or announcements have been posted yet. / እስካሁን ምንም ይፋዊ መረጃ ወይም ማስታወቂያ አልተለጠፈም።', reply_markup: BOT_MENU_KEYBOARD });
    return;
  }
  await telegramRequest('sendMessage', { chat_id: chatId, text: 'Official Information & Announcements / ይፋዊ መረጃዎች\\nSaved records: ' + records.length, reply_markup: BOT_MENU_KEYBOARD });
  for (const record of records.reverse()) {
    const stamp = new Date(record.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' });
    const body = '[' + stamp + ']\\n' + (record.text || record.caption || 'Official record');
    await telegramRequest('sendMessage', { chat_id: chatId, text: body.slice(0, 3900) });
    if (record.attachment?.fileId) {
      const method = record.attachment.type === 'photo' ? 'sendPhoto' : record.attachment.type === 'document' ? 'sendDocument' : record.attachment.type === 'video' ? 'sendVideo' : 'sendDocument';
      await telegramRequest(method, { chat_id: chatId, [record.attachment.type === 'photo' ? 'photo' : record.attachment.type === 'video' ? 'video' : 'document']: record.attachment.fileId, caption: record.caption || undefined });
    }
  }
}

async function sendAccountEmail(chatId) {
  const user = await User.findOne({ telegramChatId: String(chatId) }).select('email fullName');
  if (!user) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'This Telegram chat is not linked to an academy account. Link it from Settings → Account & Profile → Link Telegram. / ይህ ቴሌግራም ከአካዳሚ መለያ ጋር አልተገናኘም።', reply_markup: BOT_MENU_KEYBOARD });
    return;
  }
  await telegramRequest('sendMessage', { chat_id: chatId, text: 'Your registered academy email / በአካዳሚው የተመዘገበ ኢሜይል:\\n' + user.email + '\\n\\nTo change your email, use your signed-in account profile. / ኢሜይሉን ለመቀየር ወደ መለያዎ ገብተው Profile ይጠቀሙ።', reply_markup: BOT_MENU_KEYBOARD });
}

async function getTelegramAdmins() {
  const admins = await User.find({ role: 'admin', telegramChatId: { $type: 'string', $ne: '' } }).select('telegramChatId').lean();
  const configured = String(process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map((value) => value.trim()).filter(Boolean);
  return [...new Set([...admins.map((admin) => String(admin.telegramChatId)), ...configured])];
}

async function beginReceiptSubmission(chatId) {
  await TelegramBotSession.findOneAndUpdate(
    { chatId: String(chatId) },
    { $set: { mode: 'receipt', startedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await telegramRequest('sendMessage', { chat_id: chatId, text: 'Send your message, payment note, or receipt photo/document now. Each submission is saved and sent to the academy admin. Send /done when finished.\\n\\nጽሑፍ፣ የክፍያ ማስታወሻ ወይም ደረሰኝ ፎቶ/ሰነድ አሁን ይላኩ። እያንዳንዱ መልዕክት ተቀምጦ ለአስተዳዳሪው ይደርሳል። ለመጨረስ /done ይላኩ።', reply_markup: { keyboard: [[{ text: '/done' }, { text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true } });
}

function extractReceiptAttachment(message) {
  if (Array.isArray(message.photo) && message.photo.length) return { type: 'photo', fileId: message.photo[message.photo.length - 1].file_id };
  if (message.document) return { type: 'document', fileId: message.document.file_id, fileName: message.document.file_name || '' };
  if (message.video) return { type: 'video', fileId: message.video.file_id, fileName: message.video.file_name || '' };
  if (message.audio) return { type: 'audio', fileId: message.audio.file_id, fileName: message.audio.file_name || '' };
  return null;
}

async function saveAndForwardReceipt(message) {
  const chatId = String(message.chat.id);
  const user = await User.findOne({ telegramChatId: chatId }).select('_id email fullName').lean();
  const attachment = extractReceiptAttachment(message);
  const text = String(message.text || message.caption || '').trim();
  if (!text && !attachment) return false;
  const record = await TelegramBotRecord.create({
    type: 'receipt',
    chatId,
    userId: user?._id || null,
    email: user?.email || '',
    senderName: [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' '),
    text,
    caption: message.caption || '',
    attachment,
    telegramMessageId: message.message_id,
  });
  const admins = await getTelegramAdmins();
  const header = 'New Send Receipt submission #' + record._id + '\\nFrom: ' + (user?.email || message.from?.username || chatId) + '\\n' + (text || message.caption || '[Attachment]');
  for (const adminChatId of admins) {
    await telegramRequest('sendMessage', { chat_id: adminChatId, text: header.slice(0, 3900) });
    try {
      await telegramRequest('copyMessage', { chat_id: adminChatId, from_chat_id: chatId, message_id: message.message_id });
    } catch (error) {
      console.error('[telegram bot] Receipt copy failed; record remains saved:', error.message);
    }
  }
  await telegramRequest('sendMessage', { chat_id: chatId, text: 'Your submission has been saved' + (admins.length ? ' and forwarded to the academy admin.' : '. The academy team will review it.') + ' Reference: ' + record._id + ' / መልዕክትዎ ተቀምጧል።', reply_markup: { keyboard: [[{ text: '/done' }, { text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true } });
  return true;
}

async function publishInformation(message, text) {
  const user = await User.findById(message.from?.id).select('_id').catch(() => null);
  const record = await TelegramBotRecord.create({ type: 'information', chatId: String(message.chat.id), userId: user?._id || null, senderName: [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' '), text });
  const admins = await getTelegramAdmins();
  const users = await User.find({ telegramChatId: { $type: 'string', $ne: '' } }).select('telegramChatId').lean();
  const recipients = [...new Set(users.map((entry) => String(entry.telegramChatId)))];
  for (const chatId of recipients) {
    try { await telegramRequest('sendMessage', { chat_id: chatId, text: 'OFFICIAL INFORMATION / ይፋዊ መረጃ\\n\\n' + text.slice(0, 3900) }); }
    catch (error) { console.error('[telegram bot] Information broadcast failed:', error.message); }
  }
  await telegramRequest('sendMessage', { chat_id: message.chat.id, text: 'Information saved permanently. Record: ' + record._id + '. Sent to ' + recipients.length + ' linked users.' });
  return admins;
}

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
      text: 'Welcome to Ahadu Tech Academy. To link your account, sign in to the academy, open Settings → Account & Profile → Link Telegram, then open the generated link and press Start. / መለያዎን ለማገናኘት ወደ አካዳሚው ይግቡና Settings → Account & Profile → Link Telegram ይጠቀሙ።',
      reply_markup: BOT_MENU_KEYBOARD,
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
  user.telegramLinkedAt = new Date();
  user.telegramUsername = message.from?.username ? '@' + message.from.username : '';
  await user.save();
  await TelegramOtp.deleteMany({ userId: user._id, purpose: 'link' });
  await telegramRequest('sendMessage', {
    chat_id: chatId,
    text: 'Your Telegram account is now securely linked to Ahadu Tech Academy. You can use Telegram OTP for password recovery',
    reply_markup: BOT_MENU_KEYBOARD,
  });
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message?.chat?.id || message.chat.type !== 'private') return;
  const text = String(message.text || '').trim();
  const chatId = String(message.chat.id);
  const match = text.match(/^\/start(?:\s+([A-Za-z0-9_-]{20,128}))?$/);
  if (match) { await handleStart(message, match[1] || ''); return; }

  if (/^(?:menu|menu \/ ሜኑ|ሜኑ|\/menu)$/i.test(text)) { await sendMenu(chatId, true); return; }
  if (/^otp code$/i.test(text) || /^የotp ኮድ$/i.test(text)) { await sendOtpCodeForChat(chatId); return; }
  if (/^login$/i.test(text) || /^መግቢያ$/i.test(text)) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'Sign in to Ahadu Tech Academy: ' + academyUrl('/login'), reply_markup: BOT_MENU_KEYBOARD }); return;
  }
  if (/^register$/i.test(text) || /^ምዝገባ$/i.test(text)) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'Register at Ahadu Tech Academy: ' + academyUrl('/register'), reply_markup: BOT_MENU_KEYBOARD }); return;
  }
  if (/^(?:information|information \/ ኢንፎርሜሽን|ኢንፎርሜሽን|\/info)$/i.test(text)) {
    const admin = await User.findOne({ telegramChatId: chatId, role: 'admin' }).select('_id');
    if (admin) await telegramRequest('sendMessage', { chat_id: chatId, text: 'Admin: send /announce followed by the official announcement text to save and broadcast it. /announce <message>' });
    await sendInformation(chatId); return;
  }
  if (/^(?:email|email \/ ኢሜይል|ኢሜይል)$/i.test(text)) { await sendAccountEmail(chatId); return; }
  if (/^(?:send receipt|send receipt \/ ሴንድ ሪሲፕት|ሴንድ ሪሲፕት)$/i.test(text)) { await beginReceiptSubmission(chatId); return; }
  if (/^\/announce(?:@\w+)?\s+/i.test(text)) {
    const admin = await User.findOne({ telegramChatId: chatId, role: 'admin' }).select('_id');
    if (!admin) { await telegramRequest('sendMessage', { chat_id: chatId, text: 'Only linked academy administrators can publish official information.' }); return; }
    await publishInformation(message, text.replace(/^\/announce(?:@\w+)?\s+/i, '').trim()); return;
  }
  if (/^\/done$/i.test(text)) {
    await TelegramBotSession.deleteOne({ chatId, mode: 'receipt' });
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'Receipt submission closed. Your saved submissions remain available to the academy admin. / ማስገባቱ ተጠናቋል።', reply_markup: BOT_MENU_KEYBOARD }); return;
  }
  const session = await TelegramBotSession.findOne({ chatId, mode: 'receipt' });
  if (session) { await saveAndForwardReceipt(message); return; }
  if (/^\/link\b/i.test(text)) {
    await telegramRequest('sendMessage', { chat_id: chatId, text: 'For security, account linking must start while signed in to the academy: Settings → Account & Profile → Link Telegram. We never link an account using an email address sent in chat.', reply_markup: BOT_MENU_KEYBOARD });
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
