const mongoose = require('mongoose');

const universityYearSchema = new mongoose.Schema({
  yearNumber: { type: Number, required: true, min: 1, max: 7, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('UniversityYear', universityYearSchema);
