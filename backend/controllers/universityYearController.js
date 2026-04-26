const UniversityYear = require('../models/UniversityYear');

exports.getUniversityYears = async (req, res) => {
  const years = await UniversityYear.find().sort({ yearNumber: 1 });
  res.json(years);
};

exports.createUniversityYear = async (req, res) => {
  const { yearNumber } = req.body;
  if (!yearNumber || yearNumber < 1 || yearNumber > 7) return res.status(400).json({ message: 'Valid year number between 1 and 7 is required' });
  const year = await UniversityYear.create({ yearNumber });
  res.status(201).json(year);
};
