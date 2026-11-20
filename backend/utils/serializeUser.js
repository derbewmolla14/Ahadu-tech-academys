const serializeUserDoc = (userDoc, baseUrlOverride) => {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject({ getters: false }) : { ...userDoc };
  delete u.password;
  // Telegram routing identifiers are backend-only and must not be exposed in user API payloads.
  delete u.telegramChatId;
  delete u.telegramUsername;

  const publicOrigin =
    baseUrlOverride || process.env.SERVER_PUBLIC_URL?.replace(/\/$/, '') || '';

  u.profilePhotoUrl = null;
  if (u.profilePhoto) {
    if (/^(https?:\/\/|data:image\/)/i.test(u.profilePhoto)) {
      u.profilePhotoUrl = u.profilePhoto;
    } else {
      const path = `${u.profilePhoto.startsWith('/') ? '' : '/'}${u.profilePhoto}`;
      u.profilePhotoUrl = publicOrigin ? `${publicOrigin}${path}` : path;
    }
  }
  u.role = u.role === 'admin' ? 'admin' : 'user';
  return u;
};

module.exports = { serializeUserDoc };
