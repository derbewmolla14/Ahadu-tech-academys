const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['elementary', 'highschool', 'university'], required: true },
  grade: { type: String },
  department: { type: String },
  year: { type: String },
  departmentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  yearRef: { type: mongoose.Schema.Types.ObjectId, ref: 'UniversityYear' },
  locked: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
