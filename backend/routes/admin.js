const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  getUsers,
  approveUser,
  createCategory,
  getCategories,
  createCourse,
  unlockCourseForUser,
  uploadContent,
} = require('../controllers/adminController');

const upload = multer({ dest: path.join(__dirname, '../uploads') });
const router = express.Router();

router.use(auth, permit('admin'));
router.get('/users', getUsers);
router.post('/users/:id/approve', approveUser);
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.post('/courses', createCourse);
router.post('/courses/:id/unlock', unlockCourseForUser);
router.post('/content/upload', upload.single('file'), uploadContent);

module.exports = router;
