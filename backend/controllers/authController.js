const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { serializeUserDoc } = require('../utils/serializeUser');
const { sendPasswordResetEmail, verifyEmailService } = require('../utils/sendEmail');
const { getJwtSecret } = require('../config/env');

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
      profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.create({
      fullName: req.body.fullName.trim(),
      email,
      phone: (req.body.phone || '').trim(),
      password: hash,
      profilePhoto,
      role,
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
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    if (!rawEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const generic = {
      message:
        'If an account exists for that email, you will receive password reset instructions shortly.',
    };

    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
    if (!frontendUrl) {
      console.error('[password reset] FRONTEND_URL is required in production.');
      return res.status(503).json({ message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }

    let frontendOrigin;
    try {
      const parsed = new URL(frontendUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL protocol');
      frontendOrigin = parsed.toString().replace(/\/$/, '');
    } catch (configError) {
      console.error('[password reset] Invalid FRONTEND_URL:', configError.message);
      return res.status(503).json({ message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }

    // Check mail readiness before looking up the account so SMTP outages/configuration
    // errors produce the same response for known and unknown addresses.
    try {
      await verifyEmailService();
    } catch (mailConfigError) {
      console.error('[password reset] SMTP readiness check failed:', {
        code: mailConfigError.code,
        message: mailConfigError.message,
      });
      return res.status(503).json({ message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }

    const user = await User.findOne({ email: rawEmail });
    if (!user) {
      return res.status(200).json(generic);
    }

    await PasswordReset.deleteMany({ email: rawEmail });
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

    try {
      await sendPasswordResetEmail(rawEmail, 'Reset your Ahadu Tech Academy password', { html, text });
      await PasswordReset.create({ email: rawEmail, tokenHash, expiresAt });
    } catch (mailError) {
      console.error('[password reset] Email dispatch failed:', { name: mailError.name, code: mailError.code, responseCode: mailError.responseCode, message: mailError.message });
      return res.status(503).json({ message: 'We could not send the password reset email right now. Please try again later.' });
    }

    return res.status(200).json(generic);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Could not process reset request' });
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
      user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }
    if (typeof req.body.theme === 'string') {
      if (!['light', 'dark', 'system'].includes(req.body.theme)) {
        return res.status(400).json({ message: 'Invalid theme preference.' });
      }
      user.preferences.theme = req.body.theme;
    }
    if (typeof req.body.language === 'string') {
      if (!['en', 'am'].includes(req.body.language)) {
        return res.status(400).json({ message: 'Language must be English or Amharic.' });
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
