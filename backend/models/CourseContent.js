const mongoose = require('mongoose');
const courseContentSchema = new mongoose.Schema({
  category: { type: String, enum: ['elementary', 'highschool', 'university', 'skills'], default: 'university', index: true },
  academicLevel: { type: String, trim: true, default: '' },
  university: { type: String, trim: true, default: '' },
  department: { type: String, trim: true, default: '' },
  year: { type: String, trim: true, default: '' },
  grade: { type: String, trim: true, default: '' },
  stream: { type: String, trim: true, default: '' },
  semester: { type: String, trim: true, default: '' },
  courseCode: { type: String, trim: true, default: '' },
  course: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  skillCategory: { type: String, trim: true, default: '' },
  skillLevel: { type: String, trim: true, default: '' },
  duration: { type: String, trim: true, default: '' },
  instructor: { type: String, trim: true, default: '' },
  creditHours: { type: Number, min: 0, default: null },
  notes: [{ title: { type: String, required: true, trim: true }, fileUrl: { type: String, required: true, trim: true } }],
  videos: [{ title: { type: String, required: true, trim: true }, url: { type: String, required: true, trim: true }, description: { type: String, trim: true, default: '' } }],
  ppts: [{ title: { type: String, required: true, trim: true }, fileUrl: { type: String, required: true, trim: true } }],
  questions: [{ question: { type: String, required: true, trim: true }, answer: { type: String, required: true, trim: true } }],
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  isActive: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
courseContentSchema.index({ category: 1, university: 1, academicLevel: 1, department: 1, year: 1, semester: 1, course: 1 }, { unique: true });
module.exports = mongoose.model('CourseContent', courseContentSchema);
