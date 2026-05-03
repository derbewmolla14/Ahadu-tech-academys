const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, default: '' },
    role: { type: String, enum: ['user', 'student', 'admin'], default: 'user' },
    approved: { type: Boolean, default: true },
    unlockedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
