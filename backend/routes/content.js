const express = require('express');
const multer = require('multer');
const path = require('path');
const { getContentByCourse, createContent } = require('../controllers/contentController');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');

const upload = multer({ dest: path.join(__dirname, '../uploads') });
const router = express.Router();

router.get('/course/:courseId', auth, getContentByCourse);
router.post('/', auth, permit('admin'), upload.single('file'), createContent);

module.exports = router;
