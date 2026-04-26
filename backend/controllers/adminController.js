const User = require('../models/User');
const Course = require('../models/Course');
const Content = require('../models/Content');
const Category = require('../models/Category');
const AccessControl = require('../models/AccessControl');
const Department = require('../models/Department');
const UniversityYear = require('../models/UniversityYear');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('email role approved createdAt');
  res.json(users);
};

exports.approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.approved = true;
  await user.save();
  res.json({ message: 'User approved' });
};

exports.createCategory = async (req, res) => {
  const { type, name } = req.body;
  if (!type || !name) return res.status(400).json({ message: 'Type and name required' });
  const category = await Category.create({ type, name });
  res.status(201).json(category);
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};

exports.createCourse = async (req, res) => {
  const { title, level, grade, department, year, departmentId, yearId, description, isLocked } = req.body;
  if (!title || !level) return res.status(400).json({ message: 'Title and level required' });
  const course = await Course.create({
    title,
    level,
    grade,
    department,
    year,
    departmentRef: departmentId,
    yearRef: yearId,
    description,
    locked: isLocked !== undefined ? isLocked : true,
    isLocked: isLocked !== undefined ? isLocked : true,
  });
  res.status(201).json(course);
};

exports.unlockCourseForUser = async (req, res) => {
  const { userId } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  let access = await AccessControl.findOne({ user: userId, course: req.params.id });
  if (!access) access = await AccessControl.create({ user: userId, course: req.params.id, unlocked: true });
  else { access.unlocked = true; await access.save(); }
  if (!user.unlockedCourses.includes(course._id)) {
    user.unlockedCourses.push(course._id);
    await user.save();
  }
  res.json({ message: 'Course unlocked for user' });
};

exports.uploadContent = async (req, res) => {
  const { courseId, type, title, description, videoUrl, pptUrl, notes } = req.body;
  if (!courseId || !type || !title) return res.status(400).json({ message: 'Course, type, and title are required' });
  const url = req.file ? `/uploads/${req.file.filename}` : videoUrl || pptUrl || '';
  const content = await Content.create({
    course: courseId,
    type,
    title,
    url,
    description,
    videoUrl,
    pptUrl,
    notes,
  });
  res.status(201).json(content);
};
