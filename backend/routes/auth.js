const express = require('express');
const profileUpload = require('../middleware/profileUpload');
const auth = require('../middleware/auth');
const {
  register,
  registerValidators,
  login,
  me,
  forgotPassword,
  resetPassword,
  resetPasswordValidators,
  updateProfile,
  updateProfileValidators,
  changePassword,
  requestTelegramOtp,
  resetPasswordWithTelegramOtp,
  requestTelegramLink,
} = require('../controllers/authController');

const router = express.Router();

const multerTrap = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed' });
    next();
  });
};

router.post('/register', multerTrap(profileUpload.single('profilePhoto')), ...registerValidators, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', ...resetPasswordValidators, resetPassword);
router.post('/telegram/otp/request', requestTelegramOtp);
router.post('/telegram/otp/reset', resetPasswordWithTelegramOtp);
router.post('/telegram/link/request', auth, requestTelegramLink);
router.get('/me', auth, me);
router.patch('/me', auth, multerTrap(profileUpload.single('profilePhoto')), ...updateProfileValidators, updateProfile);
router.patch('/change-password', auth, changePassword);

module.exports = router;
