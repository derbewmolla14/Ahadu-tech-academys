const User = require('../models/User');

function normalizeAdminEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isDesignatedAdminEmail(email) {
  const configuredEmail = normalizeAdminEmail(process.env.SUPER_ADMIN_EMAIL);
  return Boolean(configuredEmail) && normalizeAdminEmail(email) === configuredEmail;
}

async function syncUserAdminRole(user) {
  if (!user) return user;
  const expectedRole = isDesignatedAdminEmail(user.email) ? 'admin' : 'user';
  if (user.role !== expectedRole) {
    await User.updateOne({ _id: user._id }, { $set: { role: expectedRole } });
    user.role = expectedRole;
  }
  return user;
}

module.exports = { normalizeAdminEmail, isDesignatedAdminEmail, syncUserAdminRole };
