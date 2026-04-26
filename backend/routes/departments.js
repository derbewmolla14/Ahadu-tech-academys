const express = require('express');
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');

const router = express.Router();
router.get('/', getDepartments);
router.post('/', auth, permit('admin'), createDepartment);

module.exports = router;
