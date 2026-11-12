
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      enum: [
        'elementary',
        'highschool',
        'university',
        'coding',
      ],
      required: true,
    },

    university: {
      type: String,
      trim: true,
      default: '',
    },

    grade: {
      type: String,
      default: '',
    },

    subject: {
      type: String,
      default: '',
    },

    department: {
      type: String,
      default: '',
    },

    year: {
      type: String,
      default: '',
    },

    technology: {
      type: String,
      default: '',
    },

    thumbnail: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    departmentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    yearRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityYear',
    },

    locked: {
      type: Boolean,
      default: true,
    },

    isLocked: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
