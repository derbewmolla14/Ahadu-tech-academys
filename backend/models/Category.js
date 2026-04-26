const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  type: { type: String, enum: ['grade', 'department'], required: true },
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
