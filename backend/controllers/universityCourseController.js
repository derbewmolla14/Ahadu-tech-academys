const UniversityCourse = require('../models/university/Course');

const sampleCourses = [
  {
    id: 'cs101',
    title: 'Introduction to Computer Science',
    slug: 'introduction-to-computer-science',
    department: 'Computer Science',
    level: 'Undergraduate',
    year: '1',
    description: 'Basics of computing, algorithms, and programming logic.',
  },
  {
    id: 'cs102',
    title: 'Data Structures',
    slug: 'data-structures',
    department: 'Computer Science',
    level: 'Undergraduate',
    year: '2',
    description: 'Study arrays, lists, trees, graphs, and practical data solutions.',
  },
  {
    id: 'bus101',
    title: 'Principles of Management',
    slug: 'principles-of-management',
    department: 'Business',
    level: 'Undergraduate',
    year: '1',
    description: 'Fundamentals of management for business leadership.',
  },
];

exports.getUniversityCourses = async (req, res) => {
  const { university, level, department } = req.query;
  const filter = {};
  if (university) filter.university = university;
  if (level) filter.level = level;
  if (department) filter.department = department;

  const courses = await UniversityCourse.find(filter).lean().exec();
  if (courses.length) return res.json(courses);

  const filtered = sampleCourses.filter((course) => {
    if (level && course.level !== level) return false;
    if (department && course.department !== department) return false;
    return true;
  });

  return res.json(filtered.length ? filtered : sampleCourses);
};

exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;
  const course = await UniversityCourse.findOne({ slug: courseId }).lean().exec();
  if (course) return res.json(course);
  const fallback = sampleCourses.find((item) => item.id === courseId || item.slug === courseId);
  if (!fallback) return res.status(404).json({ message: 'Course not found' });
  return res.json(fallback);
};
