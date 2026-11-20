const crypto = require('crypto');
const TelegramOtp = require('./models/TelegramOtp');
const User = require('./models/User');
const TelegramBotRecord = require('./models/TelegramBotRecord');
const TelegramBotSession = require('./models/TelegramBotSession');
const { isDesignatedAdminEmail, syncUserAdminRole } = require('./utils/adminIdentity');

const hashValue = (value) => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
let polling = false;
let offset = 0;

const BOT_MENU_KEYBOARD = { keyboard: [[{ text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true };
const ACTION_MENU_KEYBOARD = { keyboard: [[{ text: 'Login' }, { text: 'Register' }], [{ text: 'OTP Code' }], [{ text: 'Information / ኢንፎርሜሽን' }, { text: 'Email / ኢሜይል' }], [{ text: 'Send Receipt / ሴንድ ሪሲፕት' }], [{ text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true };
const ADMIN_ACTION_MENU_KEYBOARD = { keyboard: [[{ text: 'Login' }, { text: 'Register' }], [{ text: 'OTP Code' }], [{ text: 'Information / ኢንፎርሜሽን' }, { text: 'Email / ኢሜይል' }], [{ text: 'Send Receipt / ሴንድ ሪሲፕት' }], [{ text: 'Total Users / ጠቅላላ ተጠቃሚዎች' }], [{ text: 'Receipt Inbox / የደረሰኝ ሳጥን' }], [{ text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true };
function academyUrl(path) { const base = String(process.env.FRONTEND_URL || 'https://ahadu-tech-academys.vercel.app').replace(/\/$/, ''); return base + path; }
async function getLinkedAccount(chatId) {
  const user = await User.findOne({ telegramChatId: String(chatId) }).select('_id fullName email role telegramChatId telegramUsername telegramLinkedAt');
  if (!user) return null;
  await syncUserAdminRole(user);
  return user.toObject();
}
async function getActionMenuKeyboard(chatId) {
  const user = await getLinkedAccount(chatId);
  return user && isDesignatedAdminEmail(user.email) ? ADMIN_ACTION_MENU_KEYBOARD : ACTION_MENU_KEYBOARD;
}
async function sendEntryIdentification(message) {
  const chatId = String(message.chat.id);
  const user = await getLinkedAccount(chatId);
  const keyboard = user && isDesignatedAdminEmail(user.email) ? ADMIN_ACTION_MENU_KEYBOARD : BOT_MENU_KEYBOARD;
  let text;
  if (!user) {
    text = 'AHADU TECH ACADEMY · IDENTIFICATION / መታወቂያ\n\nTelegram status: Not linked to an academy account. / የቴሌግራም ሁኔታ፦ ከአካዳሚ መለያ ጋር አልተገናኘም።\n\nTo link: sign in to the academy → Settings → Account & Profile → Link Telegram, then open the secure link and press Start. / ለማገናኘት ወደ አካዳሚው ይግቡ → Settings → Account & Profile → Link Telegram ከዚያ የደህንነት ሊንኩን ከፍተው Start ይጫኑ።';
  } else {
    const designatedAdmin = isDesignatedAdminEmail(user.email);
    const roleLabel = designatedAdmin ? 'ADMIN / አስተዳዳሪ' : 'REGISTERED MEMBER / የተመዘገበ አባል';
    text = 'AHADU TECH ACADEMY · IDENTIFICATION / መታወቂያ\n\n' + roleLabel +
      '\nName: ' + (user.fullName || 'Not provided') +
      '\nRegistered email: ' + user.email +
      '\nAccount ID: ' + String(user._id) +
      '\nTelegram: Securely linked' +
      (designatedAdmin ? '\n\nAdmin actions are enabled for this designated admin account. / ለተመደበው የአስተዳዳሪ መለያ አማራጮች ነቅተዋል።' : '');
  }
  await clearActiveView(chatId, 'menu');
  await sendViewMessage(chatId, { text, reply_markup: keyboard });
}
async function sendTotalUsers(chatId, page = 1) {
  const admin = await getLinkedAccount(chatId);
  if (!admin || !isDesignatedAdminEmail(admin.email)) {
    await clearActiveView(chatId, 'menu');
    await sendViewMessage(chatId, { text: 'This action is available only to a Telegram chat securely linked to an administrator account. / ይህ አገልግሎት ከአስተዳዳሪ መለያ ጋር ለተገናኘ ቴሌግራም ብቻ ነው።', reply_markup: ACTION_MENU_KEYBOARD });
    return;
  }
  await clearActiveView(chatId, 'users');
  const filter = { email: { $type: 'string', $regex: /\S/ }, password: { $exists: true, $ne: '' } };
  const pageSize = 8;
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('_id fullName email role createdAt').sort({ createdAt: -1 }).skip((safePage - 1) * pageSize).limit(pageSize).lean(),
  ]);
  if (!users.length) {
    await sendViewMessage(chatId, { text: 'TOTAL REGISTERED USERS / ጠቅላላ የተመዘገቡ ተጠቃሚዎች\n\nNo registered user records were found. / የተመዘገበ ተጠቃሚ አልተገኘም።', reply_markup: ADMIN_ACTION_MENU_KEYBOARD });
    return;
  }
  const lines = ['TOTAL REGISTERED USERS / ጠቅላላ የተመዘገቡ ተጠቃሚዎች', 'Total: ' + total, 'Page ' + safePage + ' · showing ' + users.length + ' records', ''];
  for (const user of users) {
    lines.push('━━━━━━━━━━━━━━━━', user.fullName || 'Name not provided', 'Email: ' + user.email, 'ID: ' + String(user._id), 'Role: ' + user.role, 'Registered: ' + new Date(user.createdAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Addis_Ababa' }));
  }
  if (safePage * pageSize < total) lines.push('', 'Next page: /users ' + (safePage + 1));
  if (safePage > 1) lines.push('First page: /users 1');
  await sendViewMessage(chatId, { text: lines.join('\n').slice(0, 3900), reply_markup: ADMIN_ACTION_MENU_KEYBOARD });
}

async function clearActiveView(chatId, mode = 'idle') {
  const key = String(chatId);
  const session = await TelegramBotSession.findOne({ chatId: key }).lean();
  for (const messageId of session?.activeViewMessageIds || []) {
    try {
      await telegramRequest('deleteMessage', { chat_id: key, message_id: messageId });
    } catch (error) {
      console.warn('[telegram bot] Previous view message could not be removed:', error.message);
    }
  }
  await TelegramBotSession.findOneAndUpdate(
    { chatId: key },
    { $set: { mode, activeViewMessageIds: [], viewUpdatedAt: new Date(), startedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function sendViewMessage(chatId, payload) {
  const result = await telegramRequest('sendMessage', { ...payload, chat_id: chatId });
  if (result?.message_id != null) {
    await TelegramBotSession.updateOne(
      { chatId: String(chatId) },
      { $addToSet: { activeViewMessageIds: result.message_id }, $set: { viewUpdatedAt: new Date() } },
      { upsert: true }
    );
  }
  return result;
}

async function sendViewMedia(chatId, method, payload) {
  const result = await telegramRequest(method, { ...payload, chat_id: chatId });
  if (result?.message_id != null) {
    await TelegramBotSession.updateOne(
      { chatId: String(chatId) },
      { $addToSet: { activeViewMessageIds: result.message_id }, $set: { viewUpdatedAt: new Date() } },
      { upsert: true }
    );
  }
  return result;
}

async function sendMenu(chatId, showActions = false) {
  await clearActiveView(chatId, 'menu');
  await sendViewMessage(chatId, {
    text: showActions
      ? 'Choose an option below. / ከታች ያለውን አማራጭ ይምረጡ።'
      : 'Tap Menu to see options. / አማራጮቹን ለማየት ሜኑን ይጫኑ።',
    reply_markup: showActions ? await getActionMenuKeyboard(chatId) : BOT_MENU_KEYBOARD,
  });
}
async function sendOtpCodeForChat(chatId) {
  await clearActiveView(chatId, 'otp');
  const user = await User.findOne({ telegramChatId: String(chatId) }).select('_id email telegramChatId');
  if (!user || !user.email) {
    await sendViewMessage(chatId, { text: 'No academy account is linked to this Telegram chat. Sign in to Ahadu Tech Academy, open Settings → Account & Profile → Link Telegram, then press Start in the secure bot link. / ከዚህ ቴሌግራም ጋር የተገናኘ መለያ የለም። ወደ አካዳሚው ይግቡና Settings → Account & Profile → Link Telegram ይጠቀሙ።', reply_markup: ACTION_MENU_KEYBOARD });
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
  await sendViewMessage(chatId, { text: 'Ahadu Tech Academy OTP Code: ' + otp + '\nEmail: ' + email + '\nValid for ' + seconds + ' seconds (current 2-minute window). Use it on the academy password recovery page. Do not share this code. / የOTP ኮድ ለ2 ደቂቃ ይሰራል። በአካዳሚው የይለፍ ቃል መመለሻ ገጽ ይጠቀሙበት።', reply_markup: ACTION_MENU_KEYBOARD });
}



async function sendInformation(chatId, page = 1) {
  await clearActiveView(chatId, 'information');
  const admin = await getLinkedAccount(chatId);
  const pageSize = 10;
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const total = await TelegramBotRecord.countDocuments({ type: 'information' });
  const records = await TelegramBotRecord.find({ type: 'information' })
    .sort({ createdAt: -1 }).skip((safePage - 1) * pageSize).limit(pageSize).lean();

  if (!records.length) {
    const emptyText = total
      ? 'No more information on this page. / በዚህ ገጽ ላይ ተጨማሪ መረጃ የለም။\nUse /info 1 to view the latest announcements. / አዳዲስ ማስታወቂያዎችን ለማየት /info 1 ይጠቀሙ።'
      : 'INFORMATION / መረጃ\n\nThere are no official announcements yet. Please check again later. Official notices and identification/reference records (መታወቂያዎች) will appear here when published by the academy admin.\n\nእስካሁን ይፋዊ ማስታወቂያ የለም። እባክዎ በኋላ ይመለሱ። በአካዳሚው አስተዳዳሪ የሚታተሙ ማስታወቂያዎችና የመታወቂያ መዝገቦች እዚህ ይታያሉ።';
    await sendViewMessage(chatId, { text: (admin && isDesignatedAdminEmail(admin.email) ? 'Admin: publish an official notice with /announce followed by its text.\n\n' : '') + emptyText, reply_markup: ACTION_MENU_KEYBOARD });
    return;
  }

  const lines = ['INFORMATION & OFFICIAL ANNOUNCEMENTS / መረጃዎች እና ይፋዊ ማስታወቂያዎች', 'Page ' + safePage + ' · ' + total + ' saved record(s)', ''];
  if (admin && isDesignatedAdminEmail(admin.email)) lines.push('Admin: publish an official notice with /announce followed by its text.');
  for (const record of [...records].reverse()) {
    const stamp = new Date(record.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' });
    lines.push('━━━━━━━━━━━━━━━━', stamp, record.text || record.caption || 'Official record / ይፋዊ መዝገብ');
  }
  if (safePage * pageSize < total) lines.push('', 'Older records: /info ' + (safePage + 1));
  if (safePage > 1) lines.push('Latest records: /info 1');
  await sendViewMessage(chatId, { text: lines.join('\n').slice(0, 3900), reply_markup: ACTION_MENU_KEYBOARD });

  for (const record of records) {
    if (!record.attachment?.fileId) continue;
    const field = ['photo', 'video', 'audio'].includes(record.attachment.type) ? record.attachment.type : 'document';
    const method = field === 'photo' ? 'sendPhoto' : field === 'video' ? 'sendVideo' : field === 'audio' ? 'sendAudio' : 'sendDocument';
    await sendViewMedia(chatId, method, {
      [field]: record.attachment.fileId,
      caption: String(record.caption || '').slice(0, 900) || undefined,
    });
  }
}
async function sendAccountEmail(chatId) {
  await clearActiveView(chatId, 'email');
  const user = await User.findOne({ telegramChatId: String(chatId) }).select('email fullName');
  if (!user) {
    await sendViewMessage(chatId, { text: 'This Telegram chat is not linked to an academy account. Link it from Settings → Account & Profile → Link Telegram. / ይህ ቴሌግራም ከአካዳሚ መለያ ጋር አልተገናኘም።', reply_markup: ACTION_MENU_KEYBOARD });
    return;
  }
  await sendViewMessage(chatId, {
    text: 'ACCOUNT EMAIL / የመለያ ኢሜይል\n\nYour registered academy email: ' + user.email + '\n\nTo change your email, use your signed-in account profile. / ኢሜይሉን ለመቀየር ወደ መለያዎ ገብተው Profile ይጠቀሙ።',
    reply_markup: ACTION_MENU_KEYBOARD,
  });
}
async function getTelegramAdmins() {
  const configuredEmail = String(process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!configuredEmail) return [];
  const admin = await User.findOne({ email: configuredEmail }).select('email telegramChatId').lean();
  return admin?.telegramChatId ? [String(admin.telegramChatId)] : [];
}

async function sendReceiptInbox(chatId, page = 1) {
  const admin = await getLinkedAccount(chatId);
  if (!admin || !isDesignatedAdminEmail(admin.email)) {
    await sendViewMessage(chatId, { text: 'Receipt inbox is available only to the designated website administrator.' });
    return;
  }
  await clearActiveView(chatId, 'receiptInbox');
  const pageSize = 8;
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const [total, records] = await Promise.all([
    TelegramBotRecord.countDocuments({ type: 'receipt' }),
    TelegramBotRecord.find({ type: 'receipt' }).sort({ createdAt: -1 }).skip((safePage - 1) * pageSize).limit(pageSize).lean(),
  ]);
  const lines = ['RECEIPT INBOX / የደረሰኝ ሳጥን', 'Total submissions: ' + total, 'Page ' + safePage, ''];
  for (const record of records) {
    lines.push('━━━━━━━━━━━━━━━━', new Date(record.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' }), 'From: ' + (record.email || record.senderName || record.chatId), 'Reference: ' + String(record._id), record.text || record.caption || '[Attachment]' );
    if (record.attachment?.fileName) lines.push('File: ' + record.attachment.fileName);
  }
  if (!records.length) lines.push('No receipt submissions yet.');
  if (safePage * pageSize < total) lines.push('', 'Next page: /receipts ' + (safePage + 1));
  if (safePage > 1) lines.push('Latest: /receipts 1');
  await sendViewMessage(chatId, { text: lines.join('\\n').slice(0, 3900), reply_markup: ADMIN_ACTION_MENU_KEYBOARD });
  for (const record of records) {
    if (!record.attachment?.fileId) continue;
    const field = ['photo', 'video', 'audio'].includes(record.attachment.type) ? record.attachment.type : 'document';
    const method = field === 'photo' ? 'sendPhoto' : field === 'video' ? 'sendVideo' : field === 'audio' ? 'sendAudio' : 'sendDocument';
    await sendViewMedia(chatId, method, { [field]: record.attachment.fileId, caption: String(record.caption || record.text || '').slice(0, 900) || undefined });
  }
}
async function beginReceiptSubmission(chatId) {
  await clearActiveView(chatId, 'receipt');
  await TelegramBotSession.updateOne(
    { chatId: String(chatId) },
    { $set: { mode: 'receipt', startedAt: new Date(), activeViewMessageIds: [] } },
    { upsert: true }
  );
  await sendViewMessage(chatId, {
    text: 'SEND RECEIPT / ደረሰኝ ይላኩ\n\nSend your message, payment note, or receipt photo/document now. Each submission is saved and sent to the academy admin. Send /done when finished.\n\nጽሑፍ፣ የክፍያ ማስታወሻ ወይም ደረሰኝ ፎቶ/ሰነድ አሁን ይላኩ። እያንዳንዱ መልዕክት ተቀምጦ ለአስተዳዳሪው ይደርሳል። ለመጨረስ /done ይላኩ።',
    reply_markup: { keyboard: [[{ text: '/done' }, { text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true },
  });
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
  if (!admins.length) console.warn('[telegram bot] Receipt saved but no admin Telegram chats are configured. Ensure the configured SUPER_ADMIN_EMAIL account has linked its Telegram chat.');
  const header = 'New Send Receipt submission #' + record._id + '\nFrom: ' + (user?.email || message.from?.username || chatId) + '\n' + (text || message.caption || '[Attachment]');
  for (const adminChatId of admins) {
    await telegramRequest('sendMessage', { chat_id: adminChatId, text: header.slice(0, 3900) });
    try {
      await telegramRequest('copyMessage', { chat_id: adminChatId, from_chat_id: chatId, message_id: message.message_id });
    } catch (error) {
      console.error('[telegram bot] Receipt copy failed; record remains saved:', error.message);
    }
  }
  await clearActiveView(chatId, 'receipt');
  await sendViewMessage(chatId, { text: 'Your submission has been saved' + (admins.length ? ' and forwarded to the academy admin.' : '. The academy team will review it.') + ' Reference: ' + record._id + ' / መልዕክትዎ ተቀምጧል።', reply_markup: { keyboard: [[{ text: '/done' }, { text: 'Menu / ሜኑ' }]], resize_keyboard: true, is_persistent: true } });
  return true;
}

async function publishInformation(message, text) {
  const user = await getLinkedAccount(message.chat.id);
  if (!user || !isDesignatedAdminEmail(user.email)) return false;
  const attachment = extractReceiptAttachment(message);
  const record = await TelegramBotRecord.create({
    type: 'information',
    chatId: String(message.chat.id),
    userId: user?._id || null,
    senderName: [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' '),
    text,
    caption: message.caption || '',
    attachment,
    telegramMessageId: message.message_id,
  });
  const users = await User.find({ telegramChatId: { $type: 'string', $ne: '' } }).select('telegramChatId').lean();
  const recipients = [...new Set(users.map((entry) => String(entry.telegramChatId)))];
  if (!recipients.length) console.warn('[telegram bot] Official information saved; no linked Telegram recipients were found.');
  for (const chatId of recipients) {
    try {
      await telegramRequest('sendMessage', { chat_id: chatId, text: 'OFFICIAL INFORMATION / ይፋዊ መረጃ\n\n' + (text || message.caption || 'Official record').slice(0, 3900) });
      if (attachment?.fileId) await telegramRequest('copyMessage', { chat_id: chatId, from_chat_id: message.chat.id, message_id: message.message_id });
    } catch (error) { console.error('[telegram bot] Information broadcast failed; record remains saved:', error.message); }
  }
  await clearActiveView(message.chat.id, 'information');
  await sendViewMessage(message.chat.id, { text: 'Information saved permanently. Record: ' + record._id + '. Sent to ' + recipients.length + ' linked users.', reply_markup: ACTION_MENU_KEYBOARD });
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
    await sendEntryIdentification(message);
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
      await sendEntryIdentification(message);
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: 'Your Ahadu Tech Academy password-reset flow is open. Enter the 6-digit code already sent to this Telegram chat on the academy website before the 2-minute countdown expires.',
        reply_markup: await getActionMenuKeyboard(chatId),
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
  await sendEntryIdentification(message);
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message?.chat?.id || message.chat.type !== 'private') return;
  const text = String(message.text || message.caption || '').trim();
  const chatId = String(message.chat.id);
  const match = text.match(/^\/start(?:\s+([A-Za-z0-9_-]{20,128}))?$/);
  if (match) { await handleStart(message, match[1] || ''); return; }

  if (/^(?:menu|menu \/ ሜኑ|ሜኑ|\/menu)$/i.test(text)) { await sendMenu(chatId, true); return; }
  const totalUsersMatch = text.match(/^(?:total users(?: \/ ጠቅላላ ተጠቃሚዎች)?|ጠቅላላ ተጠቃሚዎች|\/users(?:@\w+)?(?:\s+(\d+))?)$/i);
  if (totalUsersMatch) { await sendTotalUsers(chatId, totalUsersMatch[1] || 1); return; }
  const receiptPageMatch = text.match(/^\/receipts(?:@\w+)?(?:\s+(\d+))?$/i);
  if (/^(?:receipt inbox(?: \/ የደረሰኝ ሳጥን)?|የደረሰኝ ሳጥን)$/i.test(text) || receiptPageMatch) { await sendReceiptInbox(chatId, receiptPageMatch?.[1] || 1); return; }
  if (/^login$/i.test(text) || /^መግቢያ$/i.test(text)) {
    await clearActiveView(chatId, 'login');
    await sendViewMessage(chatId, { text: 'LOGIN / መግቢያ\nSign in to Ahadu Tech Academy: ' + academyUrl('/login'), reply_markup: ACTION_MENU_KEYBOARD }); return;
  }
  if (/^register$/i.test(text) || /^ምዝገባ$/i.test(text)) {
    await clearActiveView(chatId, 'register');
    await sendViewMessage(chatId, { text: 'REGISTER / ምዝገባ\nRegister at Ahadu Tech Academy: ' + academyUrl('/register'), reply_markup: ACTION_MENU_KEYBOARD }); return;
  }
  if (/^(?:information(?: \/ ኢንፎርሜሽን)?|ኢንፎርሜሽን|\/info(?:@\w+)?(?:\s+\d+)?|\/info)$/i.test(text)) {
    const pageMatch = text.match(/^\/info(?:@\w+)?\s+(\d+)$/i);
    await sendInformation(chatId, pageMatch ? pageMatch[1] : 1); return;
  }
  if (/^(?:email|email \/ ኢሜይል|ኢሜይል)$/i.test(text)) { await sendAccountEmail(chatId); return; }
  if (/^(?:send receipt|send receipt \/ ሴንድ ሪሲፕት|ሴንድ ሪሲፕት)$/i.test(text)) { await beginReceiptSubmission(chatId); return; }
  if (/^\/announce(?:@\w+)?(?:\s+|$)/i.test(text) && (text.replace(/^\/announce(?:@\w+)?/i, '').trim() || extractReceiptAttachment(message))) {
    const admin = await getLinkedAccount(chatId);
    if (!admin || !isDesignatedAdminEmail(admin.email)) { await telegramRequest('sendMessage', { chat_id: chatId, text: 'Only the account linked to the configured website administrator email can publish official information.' }); return; }
    await publishInformation(message, text.replace(/^\/announce(?:@\w+)?\s*/i, '').trim() || message.caption || ''); return;
  }
  if (/^\/done$/i.test(text)) {
    await clearActiveView(chatId, 'menu');
    await sendViewMessage(chatId, { text: 'Receipt submission closed. Your saved submissions remain available to the academy admin. / ማስገባቱ ተጠናቋል።', reply_markup: ACTION_MENU_KEYBOARD }); return;
  }
  const session = await TelegramBotSession.findOne({ chatId, mode: 'receipt' });
  if (session) { await saveAndForwardReceipt(message); return; }
  if (/^\/link\b/i.test(text)) {
    await clearActiveView(chatId, 'menu');
    await sendViewMessage(chatId, { text: 'For security, account linking must start while signed in to the academy: Settings → Account & Profile → Link Telegram. We never link an account using an email address sent in chat.', reply_markup: ACTION_MENU_KEYBOARD });
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
