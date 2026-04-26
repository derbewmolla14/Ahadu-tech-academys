const Course = require('../models/Course');
const AccessControl = require('../models/AccessControl');

exports.getLevels = async (req, res) => {
  res.json([
    { id: 'elementary', name: 'Elementary' },
    { id: 'highschool', name: 'High School' },
    { id: 'university', name: 'University / College' },
  ]);
};

exports.getHighSchoolGrades = async (req, res) => {
  const grades = await Course.distinct('grade', { level: 'highschool' });
  res.json(grades.filter(Boolean));
};

exports.getHighSchoolSubjects = async (req, res) => {
  const { grade } = req.query;
  const subjects = await Course.find({ level: 'highschool', grade });
  res.json(subjects);
};

exports.getUniversityDepartments = async (req, res) => {
  const departments = await Course.distinct('department', { level: 'university' });
  res.json(departments.filter(Boolean));
};

exports.getUniversityYears = async (req, res) => {
  const years = await Course.distinct('year', { level: 'university' });
  res.json(years.filter(Boolean));
};

exports.getUniversityCourses = async (req, res) => {
  const { department, year } = req.query;
  const filter = { level: 'university' };
  if (department) filter.department = department;
  if (year) filter.year = year;
  const courses = await Course.find(filter);
  res.json(courses);
};

exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.locked && req.user.role !== 'admin') {
    const access = await AccessControl.findOne({ user: req.user._id, course: course._id, unlocked: true });
    if (!access) return res.status(403).json({ message: 'Course is locked for your account' });
  }
  res.json(course);
};
