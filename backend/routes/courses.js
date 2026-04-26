const express = require('express');
const {
  getLevels,
  getHighSchoolGrades,
  getHighSchoolSubjects,
  getUniversityDepartments,
  getUniversityYears,
  getUniversityCourses,
  getCourseById,
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/levels', getLevels);
router.get('/highschool/grades', getHighSchoolGrades);
router.get('/highschool/subjects', getHighSchoolSubjects);
router.get('/university/departments', getUniversityDepartments);
router.get('/university/years', getUniversityYears);
router.get('/university/courses', getUniversityCourses);
router.get('/:id', auth, getCourseById);

module.exports = router;
