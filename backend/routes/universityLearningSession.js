const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/universityLearningSessionController');

const router = express.Router();
router.use(auth);
router.get('/', controller.get);
router.post('/reset', controller.reset);
router.post('/stream', controller.selectStream);
router.post('/level', controller.selectLevel);
router.post('/department', controller.selectDepartment);
router.post('/course', controller.selectCourse);
router.post('/learning-type', controller.selectLearningType);
router.post('/exam-year', controller.selectExamYear);
router.post('/back', controller.back);

module.exports = router;
