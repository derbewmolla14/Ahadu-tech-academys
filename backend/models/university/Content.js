const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'UniversityCourse', required: true },
  videoUrl: { type: String },
  pdfUrl: { type: String },
  pptUrl: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('UniversityContent', contentSchema);
