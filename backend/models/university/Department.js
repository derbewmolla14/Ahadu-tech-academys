const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  level: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
