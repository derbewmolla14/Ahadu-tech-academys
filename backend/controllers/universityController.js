const University = require('../models/university/University');

const universities = [
  { name: 'Wollo University', slug: 'wollo-university', city: 'Dessie', established: '2007', description: 'A leading academic community in Wollo region.' },
  { name: 'AAU', slug: 'aau', city: 'Addis Ababa', established: '1950', description: 'Addis Ababa University is Ethiopia’s oldest university.' },
  { name: 'Bahir Dar', slug: 'bahir-dar', city: 'Bahir Dar', established: '2000', description: 'A major university with strong science and technology programs.' },
  { name: 'Mekelle', slug: 'mekelle', city: 'Mekelle', established: '1991', description: 'A growing university with wide academic coverage.' },
  { name: 'Woldia', slug: 'woldia', city: 'Woldia', established: '2007', description: 'Focused on regional development and student success.' },
  { name: 'Debre Berhan', slug: 'debre-berhan', city: 'Debre Berhan', established: '2007', description: 'Serves students from central Ethiopia with strong professional programs.' },
  { name: 'Jimma', slug: 'jimma', city: 'Jimma', established: '1983', description: 'A university known for medical and agricultural studies.' },
  { name: 'Gondar', slug: 'gondar', city: 'Gondar', established: '1954', description: 'Rich history and strong health sciences programs.' },
  { name: 'Debre Markos', slug: 'debre-markos', city: 'Debre Markos', established: '2005', description: 'A fast-growing institution with practical academic tracks.' },
];

const departmentMap = {
  Undergraduate: ['Computer Science', 'Business', 'Engineering', 'Education'],
  Graduate: ['Research Management', 'MBA', 'Law', 'Public Health'],
  Diploma: ['Accounting', 'Teaching', 'Graphic Design', 'Hospitality'],
};

exports.getUniversities = async (req, res) => {
  const list = await University.find().lean().exec();
  res.json(list.length ? list : universities);
};

exports.getUniversityByName = async (req, res) => {
  const { name } = req.params;
  const university = await University.findOne({ slug: name }).lean().exec();
  if (university) return res.json(university);
  const found = universities.find((item) => item.slug === name);
  if (!found) return res.status(404).json({ message: 'University not found' });
  return res.json(found);
};

exports.getUniversityLevels = async (req, res) => {
  res.json(['Undergraduate', 'Graduate', 'Diploma']);
};

exports.getUniversityDepartments = async (req, res) => {
  const { level } = req.query;
  const departments = departmentMap[level] || departmentMap.Undergraduate;
  res.json(departments);
};
