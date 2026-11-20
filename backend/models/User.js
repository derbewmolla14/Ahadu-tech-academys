const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    referralCode: { type: String, trim: true, uppercase: true, unique: true, sparse: true, index: true },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    referralPaidOutETB: { type: Number, min: 0, default: 0 },
    payoutAccount: {
      provider: { type: String, trim: true, default: '' },
      accountName: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
    },
    telegramChatId: { type: String, default: null, index: true },
    telegramUsername: { type: String, trim: true, default: '' },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String, default: '' },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, enum: ['en', 'am', 'both'], default: 'en' },
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
      paymentTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentTransaction', default: null },
      transactionReference: { type: String, trim: true, default: '' },
      amountETB: { type: Number, min: 0, default: null },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
