const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  department: { type: String },
  level: { type: String },
  year: { type: String },
  description: { type: String },
  videoUrl: { type: String },
  pdfUrl: { type: String },
  pptUrl: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('UniversityCourse', courseSchema);
