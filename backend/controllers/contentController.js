const Content = require('../models/Content');
const Course = require('../models/Course');
const AccessControl = require('../models/AccessControl');

exports.getContentByCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!req.user.approved && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'User account must be approved to view content' });
  }
  if ((course.isLocked || course.locked) && req.user.role !== 'admin') {
    const access = await AccessControl.findOne({ user: req.user._id, course: course._id, unlocked: true });
    if (!access) return res.status(403).json({ message: 'Course is locked' });
  }
  const contents = await Content.find({ course: course._id });
  res.json(contents);
};

exports.createContent = async (req, res) => {
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
