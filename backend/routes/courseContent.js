const express = require('express');
const router = express.Router();
const {
  upload,
  uploadContent,
  getContent,
  getContentById,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  updateCourse
} = require('../controllers/courseContentController');

// POST /api/content/upload - Upload or update course content
router.post('/upload', upload.array('files', 10), uploadContent);

// GET /api/content - Get course content with query parameters (public - only active courses)
router.get('/', getContent);

// GET /api/content/admin/all - Get all courses for admin (including inactive)
router.get('/admin/all', getAllCourses);

// PUT /api/content/:id/toggle-status - Toggle course active status (admin only)
router.put('/:id/toggle-status', toggleCourseStatus);

// PUT /api/content/:id - Update course details (admin only)
router.put('/:id', updateCourse);

// GET /api/content/:id - Get specific course content by ID
router.get('/:id', getContentById);

// DELETE /api/content/:id - Delete course content
router.delete('/:id', deleteContent);

module.exports = router;