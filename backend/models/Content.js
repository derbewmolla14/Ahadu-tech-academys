const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  type: { type: String, enum: ['video', 'ppt', 'note'], required: true },
  title: { type: String, required: true },
  url: { type: String },
  description: { type: String },
  videoUrl: { type: String },
  pptUrl: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
