const Department = require('../models/Department');

exports.getDepartments = async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
};

exports.createDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const department = await Department.create({ name });
  res.status(201).json(department);
};
