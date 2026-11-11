const User = require('../models/User');
const Course = require('../models/Course');
const Content = require('../models/Content');
const Category = require('../models/Category');
const AccessControl = require('../models/AccessControl');
const Department = require('../models/Department');
const UniversityYear = require('../models/UniversityYear');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('fullName email phone profilePhoto role approved createdAt');
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
  try {
    const {
      title,
      level,
      university,
      grade,
      subject,
      department,
      year,
      technology,
      description,
      isActive,
      isLocked,
    } = req.body;

    const allowedLevels = [
      'elementary',
      'highschool',
      'university',
      'coding',
    ];

    if (!title?.trim() || !allowedLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Valid course title and category are required.',
      });
    }

    if (level === 'university' &&
        (!university?.trim() || !department?.trim() || !year?.trim())) {
      return res.status(400).json({
        success: false,
        message: 'University, department and year are required.',
      });
    }

    if (level === 'elementary' || level === 'highschool') {
      if (!grade) {
        return res.status(400).json({
          success: false,
          message: 'Please select a grade.',
        });
      }
    }

    const locked = isLocked === undefined
      ? true
      : isLocked === true || isLocked === 'true';

    const course = await Course.create({
      title: title.trim(),
      level,
      university: university || '',
      grade: grade || '',
      subject: subject || '',
      department: department || '',
      year: year || '',
      technology: technology || '',
      description: description || '',
      isActive: isActive !== false && isActive !== 'false',
      locked,
      isLocked: locked,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course,
    });

  } catch (error) {
    console.error('Create course error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create course.',
    });
  }
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
