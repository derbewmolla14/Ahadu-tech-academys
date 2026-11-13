const CourseContent = require('../models/CourseContent');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDirectory = uploadsDirectory;
fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const allowedMimes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF and PowerPoint files are allowed.'), false),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const parseArray = (value, label) => {
  if (!value) return [];
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) throw new Error(label + ' must be an array.');
  return parsed;
};

const uploadContent = async (req, res) => {
  try {
    const {
      category = 'university', academicLevel = '', university = '', department = '', year = '',
      grade = '', stream = '', semester = '', courseCode = '', course, description = '',
      notes, videos, ppts, questions, isActive, status = 'published', skillCategory = '',
      skillLevel = '', duration = '', instructor = '', creditHours = ''
    } = req.body;

    if (!course || !String(course).trim()) return res.status(400).json({ success: false, message: 'Course name is required.' });
    if (!['elementary', 'highschool', 'university', 'skills'].includes(category)) return res.status(400).json({ success: false, message: 'Invalid education category.' });
    if (category === 'university' && (!university || !academicLevel || !department || !year)) return res.status(400).json({ success: false, message: 'University, academic level, department and year are required.' });
    if ((category === 'elementary' || category === 'highschool') && !grade) return res.status(400).json({ success: false, message: 'Please select a grade.' });
    if (category === 'skills' && (!skillCategory || !skillLevel)) return res.status(400).json({ success: false, message: 'Skill category and skill level are required.' });

    let parsedNotes, parsedVideos, parsedPpts, parsedQuestions;
    try {
      parsedNotes = parseArray(notes, 'Notes');
      parsedVideos = parseArray(videos, 'Videos');
      parsedPpts = parseArray(ppts, 'PowerPoints');
      parsedQuestions = parseArray(questions, 'Questions');
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Invalid material data.' });
    }

    const noteFiles = [];
    const pptFiles = [];
    (req.files || []).forEach(file => {
      const url = '/uploads/' + file.filename;
      if (file.mimetype === 'application/pdf') noteFiles.push(url);
      else pptFiles.push(url);
    });
    let noteIndex = 0;
    parsedNotes = parsedNotes.map(item => ({ ...item, fileUrl: item.fileUrl || noteFiles[noteIndex++] })).filter(item => item.title && item.fileUrl);
    let pptIndex = 0;
    parsedPpts = parsedPpts.map(item => ({ ...item, fileUrl: item.fileUrl || pptFiles[pptIndex++] })).filter(item => item.title && item.fileUrl);

    const normalizedUniversity = category === 'university' ? university.trim() : category === 'skills' ? 'Professional Skills' : category === 'elementary' ? 'Elementary' : 'High School';
    const normalizedDepartment = category === 'university' ? department.trim() : category === 'skills' ? skillCategory.trim() : (stream || 'General').trim();
    const normalizedYear = category === 'university' ? year.trim() : (grade || skillLevel || 'General').trim();
    const filter = { category, university: normalizedUniversity, academicLevel, department: normalizedDepartment, year: normalizedYear, semester: semester || '', course: course.trim() };
    const update = {
      ...filter, grade, stream, courseCode, description, notes: parsedNotes, videos: parsedVideos, ppts: parsedPpts,
      questions: parsedQuestions, status: status === 'draft' ? 'draft' : 'published',
      isActive: isActive === undefined ? true : String(isActive) !== 'false',
      skillCategory, skillLevel, duration, instructor,
      creditHours: creditHours === '' ? null : Number(creditHours),
      createdBy: req.user?._id || null
    };
    const content = await CourseContent.findOneAndUpdate(filter, { $set: update }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.status(200).json({ success: true, message: status === 'draft' ? 'Course draft saved successfully.' : 'Course published successfully.', data: content });
  } catch (error) {
    console.error('[CourseContent] Upload error:', error);
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'A course with this academic classification already exists.' });
    res.status(500).json({ success: false, message: 'Server error while saving course content.' });
  }
};

const getContent = async (req, res) => {
  try {
    const { category, university, academicLevel, department, year, grade, semester, course, search, page = 1, limit = 12 } = req.query;
    // Keep pre-existing active records visible while treating newly saved records as published by default.
    const query = { isActive: true, $or: [{ status: 'published' }, { status: { $exists: false } }] };
    for (const [key, value] of Object.entries({ category, university, academicLevel, department, year, grade, semester, course })) if (value) query[key] = value;
    if (search) query.course = { $regex: String(search).replace(/[.*+?^$()|[\]\\]/g, '\\$&'), $options: 'i' };
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
    const [items, total] = await Promise.all([
      CourseContent.find(query).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(),
      CourseContent.countDocuments(query)
    ]);
    res.json({ success: true, data: items, count: total, page: pageNumber, pages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('[CourseContent] Get content error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching courses.' });
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await CourseContent.findById(req.params.id);
    if (!content || ((!content.isActive || content.status !== 'published') && req.user?.role !== 'admin')) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid course ID.' });
  }
};

const deleteContent = async (req, res) => {
  try {
    const deleted = await CourseContent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete course.' });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseContent.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve courses.' });
  }
};

const toggleCourseStatus = async (req, res) => {
  try {
    const course = await CourseContent.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    course.isActive = !course.isActive;
    await course.save();
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not update course status.' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const allowed = ['course', 'courseCode', 'description', 'notes', 'videos', 'ppts', 'questions', 'isActive', 'status', 'semester'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const course = await CourseContent.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Could not update course.' });
  }
};

module.exports = { upload, uploadContent, getContent, getContentById, deleteContent, getAllCourses, toggleCourseStatus, updateCourse };
