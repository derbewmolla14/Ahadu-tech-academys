const express = require('express');
const {
  getUniversities,
  getUniversityByName,
  getUniversityLevels,
  getUniversityDepartments,
} = require('../controllers/universityController');

const router = express.Router();

router.get('/', getUniversities);
router.get('/:name', getUniversityByName);
router.get('/:name/levels', getUniversityLevels);
router.get('/:name/departments', getUniversityDepartments);

module.exports = router;
