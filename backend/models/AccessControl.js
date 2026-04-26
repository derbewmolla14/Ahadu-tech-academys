const mongoose = require('mongoose');

const accessControlSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  unlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('AccessControl', accessControlSchema);
