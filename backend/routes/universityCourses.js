const express = require('express');
const {
  getUniversityCourses,
  getCourseById,
} = require('../controllers/universityCourseController');

const router = express.Router();

router.get('/', getUniversityCourses);
router.get('/:courseId', getCourseById);

module.exports = router;
