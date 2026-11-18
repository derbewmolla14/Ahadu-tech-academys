const express = require('express');
const router = express.Router();
const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) { req.user = null; return next(); }
  return auth(req, res, next);
};
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const {
  upload,
  uploadContent,
  getContent,
  getContentById,
  streamCourseMaterial,
  downloadCourseVideo,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  toggleCoursePremium,
  updateCourse,
  unlockCourseForStudent,
  lockCourseForStudent,
  getStudentsForPremiumAccess
} = require('../controllers/courseContentController');

// POST /api/content/upload - Upload or update course content
router.post('/upload', auth, permit('admin'), upload.array('files', 10), uploadContent);

// GET /api/content - Get course content with query parameters (public - only active courses)
router.get('/', optionalAuth, getContent);

// GET /api/content/admin/all - Get all courses for admin (including inactive)
router.get('/admin/all', auth, permit('admin'), getAllCourses);
router.get('/admin/students', auth, permit('admin'), getStudentsForPremiumAccess);
router.get('/:id/material/:kind/:index', auth, streamCourseMaterial);
router.get('/:id/video/:index', auth, downloadCourseVideo);\nrouter.get('/:id/video/:index/download', auth, downloadCourseVideo);
router.post('/:id/unlock', auth, permit('admin'), unlockCourseForStudent);
router.delete('/:id/unlock/:userId', auth, permit('admin'), lockCourseForStudent);

// PUT /api/content/:id/toggle-status - Toggle course active status (admin only)
router.put('/:id/toggle-status', auth, permit('admin'), toggleCourseStatus);
router.patch('/:id/premium', auth, permit('admin'), toggleCoursePremium);

// PUT /api/content/:id - Update course details (admin only)
router.put('/:id', auth, permit('admin'), updateCourse);

// GET /api/content/:id - Get specific course content by ID
router.get('/:id', auth, getContentById);

// DELETE /api/content/:id - Delete course content
router.delete('/:id', auth, permit('admin'), deleteContent);

module.exports = router;