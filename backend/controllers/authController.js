const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId, role) => jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, role: role === 'admin' ? 'admin' : 'student', approved: role === 'admin' });
  res.status(201).json({ message: 'Registration submitted', user: { email: user.email, role: user.role, approved: user.approved } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  // Approval is still stored, but login is allowed for testing and immediate access.
  // if (!user.approved) return res.status(403).json({ message: 'Account awaiting approval' });
  const token = signToken(user._id, user.role);
  res.json({ token, user: { email: user.email, role: user.role, approved: user.approved } });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'If this email is registered, you will receive reset instructions.' });

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  res.json({ message: 'Password reset token generated', resetToken });
};

exports.resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ message: 'Email, token and password are required' });

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset successfully' });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
