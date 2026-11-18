const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, default: '' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, enum: ['en', 'am'], default: 'en' },
    },
    role: { type: String, enum: ['user', 'student', 'admin'], default: 'user' },
    approved: { type: Boolean, default: true },
    unlockedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    unlockedCourseContents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseContent' }],
    unlockedUniversityResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UniversityResource' }],
    downloadApprovals: [{
      resourceModel: { type: String, enum: ['CourseContent', 'UniversityResource'], required: true },
      resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      approvedAt: { type: Date, default: null },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
