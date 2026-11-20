const multer = require('multer');

const storage = multer.memoryStorage();

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
