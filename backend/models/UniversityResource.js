const mongoose = require('mongoose');

const universityResourceSchema = new mongoose.Schema({
  stream: { type: String, enum: ['Natural', 'Social', 'Health', 'Diploma'], required: true, index: true },
  language: { type: String, enum: ['en', 'am'], default: 'en', index: true },
  level: { type: String, enum: ['Freshman', 'Remedial', 'Senior', 'Diploma'], required: true, index: true },
  department: { type: String, trim: true, default: '' },
  course: { type: String, trim: true, default: '' },
  kind: { type: String, enum: ['course-material', 'exam-question', 'exit-exam'], required: true, index: true },
  academicYear: { type: String, trim: true, default: 'All Years' },
  resourceType: { type: String, enum: ['pdf', 'ppt', 'video', 'image', 'text'], required: true },
  title: { type: String, required: true, trim: true },
  textContent: { type: String, default: '' },
  answer: { type: String, default: '' },
  solution: { type: String, default: '' },
  accessType: { type: String, enum: ['free', 'premium'], default: 'free', index: true },
  storedFileName: { type: String, default: '' },
  originalFileName: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null },
}, { timestamps: true });

universityResourceSchema.index({ stream: 1, level: 1, department: 1, course: 1, kind: 1, academicYear: 1, status: 1 });
universityResourceSchema.index({ language: 1, status: 1 });

module.exports = mongoose.models.UniversityResource || mongoose.model('UniversityResource', universityResourceSchema);
