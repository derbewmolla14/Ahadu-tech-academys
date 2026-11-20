const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { serializeUserDoc } = require('../utils/serializeUser');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const { getJwtSecret } = require('../config/env');

const TelegramOtp = require('../models/TelegramOtp');
const AppSetting = require('../models/AppSetting');

const TELEGRAM_OTP_TTL_MS = 2 * 60 * 1000;
const TELEGRAM_OTP_MAX_ATTEMPTS = 5;

function hashTelegramValue(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function hashTelegramOtp(value) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(value), 'utf8').digest('hex');
}

function secureHashEquals(a, b) {
  const left = Buffer.from(String(a), 'hex');
  const right = Buffer.from(String(b), 'hex');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function telegramApi(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    const error = new Error('Telegram bot is not configured (TELEGRAM_BOT_TOKEN).');
    error.code = 'TELEGRAM_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok !== true) {
    const error = new Error(data.description || 'Telegram API request failed.');
    error.code = 'TELEGRAM_DELIVERY_FAILED';
    error.telegramStatus = response.status;
    throw error;
  }
  return data.result;
}

exports.requestTelegramLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found.' });
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ message: 'Telegram account linking is not configured yet.' });
    }
    const savedBotSetting = await AppSetting.findOne({ key: 'telegramBotLink' }).select('value');
    const configuredLink = String(savedBotSetting?.value || process.env.TELEGRAM_BOT_USERNAME || '').trim();
    const usernameMatch = configuredLink.match(/(?:https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\/)?@?([A-Za-z0-9_]{5,32})\/?$/i);
    const username = usernameMatch?.[1];
    if (!username) return res.status(503).json({ message: 'Telegram bot username is not configured yet.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const challenge = await TelegramOtp.create({
      purpose: 'link',
      userId: user._id,
      email: user.email,
      otpHash: hashTelegramValue(rawToken),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await TelegramOtp.deleteMany({ userId: user._id, purpose: 'link', _id: { $ne: challenge._id } });
    const deepLink = 'https://t.me/' + username + '?start=' + encodeURIComponent(rawToken);
    return res.json({
      message: 'Open the Telegram bot link and press Start to securely link this account.',
      telegramLink: deepLink,
      expiresInSeconds: 600,
    });
  } catch (error) {
    console.error('[telegram link] Could not create link challenge:', error.message);
    return res.status(500).json({ message: 'Could not create a Telegram link. Please try again.' });
  }
};

exports.requestTelegramOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Enter a valid registered email address.' });
    }
    if (!process.env.TELEGRAM_BOT_TOKEN?.trim()) {
      return res.status(503).json({ code: 'TELEGRAM_NOT_CONFIGURED', message: 'Telegram password reset is not configured yet.' });
    }

    const user = await User.findOne({ email }).select('_id email telegramChatId');
    if (!user) return res.status(200).json({ message: 'If this account has a linked Telegram chat, an OTP will be sent.' });
    if (!user.telegramChatId) {
      const savedBotSetting = await AppSetting.findOne({ key: 'telegramBotLink' }).select('value');
      const configuredLink = String(savedBotSetting?.value || process.env.TELEGRAM_BOT_USERNAME || '').trim();
      const match = configuredLink.match(/(?:https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\/)?@?([A-Za-z0-9_]{5,32})\/?$/i);
      const telegramBotLink = match?.[1] ? 'https://t.me/' + match[1] : '';
      return res.status(409).json({
        code: 'TELEGRAM_NOT_LINKED',
        message: 'No Telegram account is linked to this account. Sign in, open Settings → Account & Profile → Link Telegram, and press Start in the bot. You can also use Reset via Email.',
        telegramBotLink,
        nextStep: 'SIGN_IN_AND_CREATE_SECURE_LINK',
      });
    }

    const now = Date.now();
    const slotNumber = Math.floor(now / TELEGRAM_OTP_TTL_MS);
    const expiresAt = new Date((slotNumber + 1) * TELEGRAM_OTP_TTL_MS);
    await TelegramOtp.updateMany(
      { userId: user._id, purpose: 'password-reset', used: false },
      { $set: { used: true } }
    );

    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const rawFlowToken = crypto.randomBytes(32).toString('hex');
    const challenge = await TelegramOtp.create({
      purpose: 'password-reset',
      userId: user._id,
      email: user.email,
      chatId: user.telegramChatId,
      otpHash: hashTelegramOtp(otp),
      flowTokenHash: hashTelegramValue(rawFlowToken),
      slotNumber,
      verified: false,
      verifiedAt: null,
      expiresAt,
    });

    try {
      await telegramApi('sendMessage', {
        chat_id: user.telegramChatId,
        text: 'Ahadu Tech Academy password reset code: ' + otp + '\nThis code is valid only in the current 2-minute window. Do not share it with anyone.',
      });
    } catch (deliveryError) {
      await TelegramOtp.deleteOne({ _id: challenge._id });
      console.error('[telegram otp] Delivery failed:', { code: deliveryError.code, message: deliveryError.message });
      return res.status(503).json({ code: 'TELEGRAM_DELIVERY_FAILED', message: 'Telegram could not deliver your code. Please check the bot and try again.' });
    }

    const savedBotSetting = await AppSetting.findOne({ key: 'telegramBotLink' }).select('value');
    const configuredLink = String(savedBotSetting?.value || process.env.TELEGRAM_BOT_USERNAME || '').trim();
    const match = configuredLink.match(/(?:https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\/)?@?([A-Za-z0-9_]{5,32})\/?$/i);
    const telegramBotLink = match?.[1] ? 'https://t.me/' + match[1] : '';
    const telegramDeepLink = telegramBotLink ? telegramBotLink + '?start=' + encodeURIComponent(rawFlowToken) : '';
    return res.status(200).json({
      message: 'A 6-digit code was sent to your linked Telegram account.',
      telegramBotLink,
      telegramDeepLink,
      expiresInSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)),
      expiresAt: expiresAt.toISOString(),
      slotNumber,
    });
  } catch (error) {
    console.error('[telegram otp] Request failed:', { name: error.name, code: error.code, message: error.message });
    return res.status(500).json({ code: 'OTP_REQUEST_FAILED', message: 'Could not send a Telegram code. Please try again.' });
  }
};

exports.verifyTelegramOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ code: 'INVALID_OTP_INPUT', message: 'Enter a valid email and the 6-digit Telegram code.' });
    }

    const now = Date.now();
    const slotNumber = Math.floor(now / TELEGRAM_OTP_TTL_MS);
    const challenge = await TelegramOtp.findOne({
      email,
      purpose: 'password-reset',
      slotNumber,
      used: false,
      verified: false,
      expiresAt: { $gt: new Date(now) },
    }).sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({ code: 'OTP_EXPIRED_OR_INVALID', message: 'This code has expired or is invalid. Request a new code.' });
    }
    if (challenge.attempts >= TELEGRAM_OTP_MAX_ATTEMPTS) {
      await TelegramOtp.updateOne({ _id: challenge._id, used: false }, { $set: { used: true } });
      return res.status(429).json({ code: 'OTP_ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Request a new code.' });
    }

    const submittedHash = hashTelegramOtp(otp);
    if (!secureHashEquals(challenge.otpHash, submittedHash)) {
      const updated = await TelegramOtp.findOneAndUpdate(
        { _id: challenge._id, used: false, verified: false, attempts: { $lt: TELEGRAM_OTP_MAX_ATTEMPTS }, slotNumber, expiresAt: { $gt: new Date() } },
        { $inc: { attempts: 1 } },
        { new: true }
      );
      const attemptsRemaining = Math.max(0, TELEGRAM_OTP_MAX_ATTEMPTS - (updated?.attempts || TELEGRAM_OTP_MAX_ATTEMPTS));
      if (!updated || attemptsRemaining === 0) await TelegramOtp.updateOne({ _id: challenge._id }, { $set: { used: true } });
      return res.status(400).json({
        code: attemptsRemaining ? 'OTP_INCORRECT' : 'OTP_ATTEMPTS_EXCEEDED',
        message: attemptsRemaining ? 'Incorrect code. ' + attemptsRemaining + ' attempts remaining.' : 'Too many incorrect attempts. Request a new code.',
        attemptsRemaining,
      });
    }

    const claimed = await TelegramOtp.findOneAndUpdate(
      { _id: challenge._id, email, otpHash: submittedHash, used: false, verified: false, slotNumber, expiresAt: { $gt: new Date() } },
      { $set: { verified: true, verifiedAt: new Date() } },
      { new: true }
    );
    if (!claimed) return res.status(400).json({ code: 'OTP_EXPIRED_OR_USED', message: 'This code has expired or has already been used. Request a new code.' });

    return res.json({
      verified: true,
      message: 'Telegram code verified. Set your new password before this 2-minute window ends.',
      expiresAt: claimed.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[telegram otp] Verification failed:', { name: error.name, code: error.code, message: error.message });
    return res.status(500).json({ code: 'OTP_VERIFICATION_FAILED', message: 'Could not verify the Telegram code. Please try again.' });
  }
};

exports.resetPasswordWithTelegramOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Enter the email used to request the Telegram code.' });
    }
    if (password.length < 8 || password.length > 128 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: 'Password must be 8–128 characters and include at least one letter and one number.' });
    }

    const now = Date.now();
    const slotNumber = Math.floor(now / TELEGRAM_OTP_TTL_MS);
    const challenge = await TelegramOtp.findOne({
      email,
      purpose: 'password-reset',
      slotNumber,
      used: false,
      verified: true,
      verifiedAt: { $ne: null },
      expiresAt: { $gt: new Date(now) },
    }).sort({ createdAt: -1 });
    if (!challenge) {
      return res.status(400).json({ code: 'OTP_VERIFICATION_REQUIRED', message: 'Verify a current Telegram code before saving your new password.' });
    }

    const user = await User.findOne({ _id: challenge.userId, email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Unable to reset this account password.' });

    const consumed = await TelegramOtp.findOneAndUpdate(
      { _id: challenge._id, userId: user._id, email, slotNumber, used: false, verified: true, expiresAt: { $gt: new Date() } },
      { $set: { used: true } },
      { new: true }
    );
    if (!consumed) return res.status(400).json({ code: 'OTP_EXPIRED_OR_USED', message: 'Your verified code expired. Request and verify a new code.' });

    user.password = await bcrypt.hash(password, 12);
    await user.save();
    await TelegramOtp.deleteMany({ userId: user._id, purpose: 'password-reset' });
    await PasswordReset.deleteMany({ email });
    return res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('[telegram otp] Password reset failed:', { name: error.name, code: error.code, message: error.message });
    return res.status(500).json({ message: 'Could not reset your password. Please try again.' });
  }
};

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token, 'utf8').digest('hex');

/** JWT + API surface: collapse legacy roles to admin | user */
const jwtRole = (role) => (role === 'admin' ? 'admin' : 'user');

exports.registerValidators = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 120 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 24 })
    .withMessage('Phone must be 3–24 characters'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8–128 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must include at least one letter and one number'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  body('inviteCode').optional().isString(),
  body('referralCode').optional().isString().trim().isLength({ min: 6, max: 20 }),
];

exports.updateProfileValidators = [
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 120 }),
  body('phone').optional().trim().isLength({ max: 48 }).withMessage('Phone too long'),
];

async function finalizeRegister(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  try {
    const email = req.body.email;
    let role = req.body.role === 'admin' ? 'admin' : 'user';

    if (role === 'admin') {
      const invite = process.env.ADMIN_INVITE_CODE;
      if (!invite || req.body.inviteCode !== invite) {
        return res.status(403).json({
          message:
            'Admin signup requires a valid invitation code set by your organization.',
        });
      }
    }

    const existing = await User.findOne({ email }).select('_id');
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(req.body.password, 12);
    let profilePhoto = '';
    if (req.file) {
      profilePhoto = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const referralCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    let referrer = null;
    if (role !== 'admin' && req.body.referralCode) {
      const normalizedCode = String(req.body.referralCode).trim().toUpperCase();
      const referringUser = await User.findOne({ referralCode: normalizedCode, role: { $ne: 'admin' } }).select('_id');
      if (!referringUser) return res.status(400).json({ message: 'This referral link is invalid or no longer available.' });
      referrer = referringUser._id;
    }

    const user = await User.create({
      fullName: req.body.fullName.trim(),
      email,
      phone: (req.body.phone || '').trim(),
      password: hash,
      profilePhoto,
      role,
      referralCode,
      referrer,
      approved: true,
    });

    const fresh = await User.findById(user._id);
    const token = signToken(user._id, jwtRole(role));
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: serializeUserDoc(fresh),
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    console.error(e);
    return res.status(500).json({ message: 'Registration failed' });
  }
}

exports.register = async (req, res) => finalizeRegister(req, res);

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+password'
    );

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id, jwtRole(user.role));
    const plain = await User.findById(user._id);

    res.json({
      token,
      user: serializeUserDoc(plain),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  let processingStage = 'validate_request';
  try {
    const rawEmail = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Enter a valid email address.' });
    }

    const generic = {
      message:
        'If an account exists for that email, you will receive password reset instructions shortly.',
    };

    const frontendUrl = process.env.FRONTEND_URL?.trim() ||
      (process.env.NODE_ENV === 'production'
        ? 'https://ahadu-tech-academys.vercel.app'
        : 'http://localhost:5173');

    let frontendOrigin;
    try {
      const parsed = new URL(frontendUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL protocol');
      frontendOrigin = parsed.toString().replace(/\/$/, '');
    } catch (configError) {
      console.error('[password reset] Invalid FRONTEND_URL configuration:', {
        message: configError.message,
        hint: 'Set FRONTEND_URL to the public HTTPS frontend origin, without a reset-password path.',
      });
      return res.status(500).json({
        code: 'PASSWORD_RESET_URL_MISCONFIGURED',
        message: 'Password reset links are temporarily unavailable. Please contact support.',
      });
    }

    processingStage = 'find_user';
    const user = await User.findOne({ email: rawEmail });
    if (!user) {
      return res.status(200).json(generic);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const resetUrl = frontendOrigin + '/reset-password?token=' + encodeURIComponent(rawToken) + '&email=' + encodeURIComponent(rawEmail);

    const html = '<p>Hello,</p>' +
      '<p>You requested to reset your Ahadu Tech Academy password.</p>' +
      '<p><a href="' + resetUrl + '">Set a new password</a></p>' +
      '<p>This link expires in one hour and can only be used once.</p>' +
      '<p>If you did not request this, you can ignore this email.</p>';
    const text = 'You requested to reset your Ahadu Tech Academy password.\n' +
      'Open this link to choose a new password: ' + resetUrl + '\n' +
      'This link expires in one hour and can only be used once.\n' +
      'If you did not request this, you can ignore this email.';

    // Persist the token before dispatch so a quickly opened email link is
    // already valid. Keep previous links until the new message is accepted.
    processingStage = 'create_reset_token';
    const resetRecord = await PasswordReset.create({ email: rawEmail, tokenHash, expiresAt });
    try {
      processingStage = 'send_reset_email';
      await sendPasswordResetEmail(rawEmail, 'Reset your Ahadu Tech Academy password', { html, text });
      processingStage = 'cleanup_previous_tokens';
      await PasswordReset.deleteMany({ email: rawEmail, _id: { $ne: resetRecord._id } }).catch((cleanupError) => {
        console.error('[password reset] Email was accepted, but previous token cleanup failed:', {
          name: cleanupError.name,
          code: cleanupError.code,
          message: cleanupError.message,
        });
      });
    } catch (mailError) {
      await PasswordReset.deleteOne({ _id: resetRecord._id }).catch((cleanupError) => {
        console.error('[password reset] Failed to remove undelivered token:', cleanupError.message);
      });
      console.error('[password reset] Email dispatch failed:', {
        provider: mailError.provider || (process.env.RESEND_API_KEY?.trim() ? 'resend' : 'smtp'),
        name: mailError.name,
        code: mailError.code,
        providerStatus: mailError.providerStatus || mailError.status,
        providerCode: mailError.providerCode || mailError.responseCode,
        providerRequestId: mailError.providerRequestId,
        causeName: mailError.causeName || mailError.cause?.name,
        causeCode: mailError.causeCode || mailError.cause?.code,
        message: mailError.message,
        hint: mailError.code === 'EMAIL_INVALID_CONFIG'
          ? 'Check the Resend API key and verify the sender domain/address.'
          : mailError.code === 'EMAIL_NOT_CONFIGURED'
            ? 'Set RESEND_API_KEY and RESEND_FROM (or SMTP_FROM / EMAIL_FROM).'
            : 'Check the email provider status and network connectivity.',
      });
      const configurationError = ['EMAIL_NOT_CONFIGURED', 'EMAIL_INVALID_CONFIG'].includes(mailError.code);
      const rejectedError = mailError.code === 'EMAIL_PROVIDER_REJECTED';
      return res.status(configurationError ? 500 : rejectedError ? 502 : 503).json({
        code: configurationError
          ? mailError.code
          : rejectedError
            ? 'EMAIL_PROVIDER_REJECTED'
            : 'EMAIL_TEMPORARILY_UNAVAILABLE',
        message: configurationError
          ? 'Password reset email is not configured correctly. Please contact support.'
          : rejectedError
            ? 'The email provider rejected the message. Please contact support if this continues.'
            : 'The email service is temporarily unavailable. Please try again shortly.',
      });
    }

    return res.status(200).json(generic);
  } catch (e) {
    console.error('[password reset] Request processing failed:', {
      stage: processingStage,
      name: e.name,
      code: e.code,
      message: e.message,
      stack: e.stack,
      mongoReadyState: mongoose.connection.readyState,
      hint: mongoose.connection.readyState !== 1
        ? 'Check the Render MongoDB connection and Atlas network access list.'
        : processingStage === 'send_reset_email'
          ? 'Inspect the email provider diagnostics above; verify the Resend API key and sender domain/address.'
          : processingStage === 'create_reset_token'
            ? 'Check MongoDB write permissions and PasswordReset collection/index state.'
            : undefined,
    });
    const databaseUnavailable = mongoose.connection.readyState !== 1 ||
      ['MongoServerSelectionError', 'MongooseServerSelectionError', 'MongoNetworkError'].includes(e.name);
    if (databaseUnavailable) {
      res.set('Retry-After', '3');
      return res.status(503).json({
        code: 'AUTH_DATABASE_UNAVAILABLE',
        message: 'The account service is reconnecting. Please retry shortly.',
      });
    }
    return res.status(500).json({
      code: 'PASSWORD_RESET_PROCESSING_FAILED',
      message: 'We could not complete the password reset request. Please try again later or contact support.',
    });
  }
};

exports.resetPasswordValidators = [
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('token').trim().notEmpty().withMessage('Reset token required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must include at least one letter and one number'),
];

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const email = req.body.email;
    const tokenHash = hashResetToken(req.body.token);

    const record = await PasswordReset.findOne({
      email,
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    await user.save();

    await PasswordReset.deleteMany({ email });
    await TelegramOtp.deleteMany({ email, purpose: 'password-reset' });

    res.json({ message: 'Password has been reset successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Reset failed' });
  }
};

exports.me = async (req, res) => {
  const plain = await User.findById(req.user._id);
  res.json({ user: serializeUserDoc(plain) });
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      return res.status(403).json({ message: 'Email address can only be changed by an administrator.' });
    }

    if (typeof req.body.fullName === 'string' && req.body.fullName.trim()) {
      user.fullName = req.body.fullName.trim();
    }
    if (typeof req.body.phone === 'string') {
      user.phone = req.body.phone.trim().slice(0, 48);
    }
    if (req.file) {
      user.profilePhoto = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    if (typeof req.body.theme === 'string') {
      if (!['light', 'dark', 'system'].includes(req.body.theme)) {
        return res.status(400).json({ message: 'Invalid theme preference.' });
      }
      user.preferences.theme = req.body.theme;
    }
    if (typeof req.body.language === 'string') {
      if (!['en', 'am', 'english', 'amharic', 'both'].includes(req.body.language)) {
        return res.status(400).json({ message: 'Language must be English, Amharic, or Both.' });
      }
      user.preferences.language = req.body.language;
    }

    await user.save();
    res.json({
      message: 'Profile updated',
      user: serializeUserDoc(user),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Update failed' });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 8 || newPassword.length > 128 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({ message: 'New password must be 8–128 characters and include at least one letter and one number.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Choose a new password different from your current password.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return res.status(400).json({ message: 'Your current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Unable to change password.' });
  }
};
