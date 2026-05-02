const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  city: { type: String },
  established: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('University', universitySchema);
