const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const router = express.Router();
const { upload, uploadContent, getContent, getContentById, deleteContent, getAllCourses, toggleCourseStatus, updateCourse } = require('../controllers/courseContentController');

router.get('/', getContent);
router.post('/upload', auth, permit('admin'), upload.array('files', 10), uploadContent);
router.get('/admin/all', auth, permit('admin'), getAllCourses);
router.put('/:id/toggle-status', auth, permit('admin'), toggleCourseStatus);
router.put('/:id', auth, permit('admin'), updateCourse);
router.delete('/:id', auth, permit('admin'), deleteContent);
router.get('/:id', getContentById);

module.exports = router;
