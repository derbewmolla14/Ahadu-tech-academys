const mongoose = require('mongoose');

const courseContentSchema = new mongoose.Schema({
  level: { type: String, enum: ['elementary', 'highschool', 'university', 'coding'], default: 'university' },
  language: { type: String, enum: ['en', 'am'], default: 'en', index: true },
  grade: { type: String, default: '' },
  subject: { type: String, default: '' },
  technology: { type: String, default: '' },
  faculty: { type: String, enum: ['Natural Science', 'Social Science', 'Health Science', 'Diploma', "Master's Degree", 'PhD', ''], default: '' },
  studyStage: { type: String, enum: ['Remedial', 'Freshman', 'Senior', 'Diploma', 'Masters', 'PhD', ''], default: '' },
  contentType: { type: String, enum: ['course-materials', 'exit-exam'], default: 'course-materials', index: true },
  courseCode: { type: String, trim: true, default: '' },
  university: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: false,
    trim: true,
    default: 'All Years'
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  notes: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    }
  }],
  videos: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  }],
  ppts: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    }
  }],
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index preserves legacy identity while allowing a shared 'All Years' course.
courseContentSchema.index({ university: 1, department: 1, year: 1, course: 1 }, { unique: true });
courseContentSchema.index({ level: 1, language: 1, isActive: 1 });

module.exports = mongoose.model('CourseContent', courseContentSchema);