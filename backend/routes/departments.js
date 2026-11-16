const express = require('express');
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');

const router = express.Router();
router.get('/', getDepartments);
router.post('/', auth, permit('admin'), createDepartment);
router.put('/:id', auth, permit('admin'), updateDepartment);
router.delete('/:id', auth, permit('admin'), deleteDepartment);

module.exports = router;
