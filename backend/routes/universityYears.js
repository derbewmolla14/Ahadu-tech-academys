const express = require('express');
const { getUniversityYears, createUniversityYear } = require('../controllers/universityYearController');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');

const router = express.Router();
router.get('/', getUniversityYears);
router.post('/', auth, permit('admin'), createUniversityYear);

module.exports = router;
