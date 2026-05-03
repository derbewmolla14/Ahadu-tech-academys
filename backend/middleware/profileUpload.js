const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `${crypto.randomBytes(16).toString('hex')}${safeExt}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype || '');
    if (!ok) {
      cb(new Error('Only JPEG, PNG, WebP or GIF uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});
