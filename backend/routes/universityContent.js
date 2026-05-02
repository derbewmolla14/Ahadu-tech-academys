const express = require('express');
const { getContentByCourseId } = require('../controllers/universityContentController');

const router = express.Router();

router.get('/:courseId', getContentByCourseId);

module.exports = router;
