const Department = require('../models/Department');
const CATEGORIES = Department.CATEGORIES.filter((item) => item !== 'Uncategorized');

exports.getDepartments = async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.includeInactive !== 'true') query.isActive = true;
    const departments = await Department.find(query).sort({ name: 1 }).lean();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Unable to load departments.' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, category, description = '', isActive = true } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Department name is required.' });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Select a valid academic category.' });
    const normalizedName = name.trim().toLocaleLowerCase();
    const existing = await Department.findOne({ category, normalizedName });
    if (existing) return res.status(409).json({ message: 'This department already exists in this category.' });
    const department = await Department.create({ name: name.trim(), normalizedName, category, description, isActive: isActive !== false });
    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'This department already exists in this category.' : 'Unable to create department.' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, category, description, isActive } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found.' });
    const nextName = name === undefined ? department.name : String(name).trim();
    const nextCategory = category === undefined ? department.category : category;
    if (!nextName) return res.status(400).json({ message: 'Department name is required.' });
    if (!CATEGORIES.includes(nextCategory)) return res.status(400).json({ message: 'Select a valid academic category.' });
    const normalizedName = nextName.toLocaleLowerCase();
    const duplicate = await Department.findOne({ _id: { $ne: department._id }, category: nextCategory, normalizedName });
    if (duplicate) return res.status(409).json({ message: 'This department already exists in this category.' });
    department.name = nextName;
    department.normalizedName = normalizedName;
    department.category = nextCategory;
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive === true || isActive === 'true';
    await department.save();
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'This department already exists in this category.' : 'Unable to update department.' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!department) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deactivated. Existing courses have been preserved.', department });
  } catch (error) {
    console.error('Deactivate department error:', error);
    res.status(500).json({ message: 'Unable to deactivate department.' });
  }
};
