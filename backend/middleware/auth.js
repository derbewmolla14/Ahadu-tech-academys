const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/env');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Invalid token user' });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
