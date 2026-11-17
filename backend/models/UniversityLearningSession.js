const mongoose = require('mongoose');

const universityLearningSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  state: {
    type: String,
    enum: [
      'SELECT_STREAM', 'SELECT_LEVEL', 'JUNIOR_COURSES',
      'JUNIOR_LEARNING_TYPE', 'EXAM_YEAR', 'EXAM_QUESTIONS',
      'JUNIOR_MATERIALS', 'SENIOR_DEPARTMENTS',
      'SENIOR_LEARNING_TYPE', 'SENIOR_EXIT_EXAM',
      'SENIOR_COURSES', 'SENIOR_MATERIALS'
    ],
    default: 'SELECT_STREAM',
    required: true
  },
  stream: { type: String, enum: ['Natural Science', 'Social Science', null], default: null },
  level: { type: String, enum: ['Freshman', 'Remedial', 'Senior', null], default: null },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  departmentName: { type: String, default: null },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseContent', default: null },
  courseName: { type: String, default: null },
  learningType: { type: String, enum: ['EXAM_QUESTION', 'COURSE_MATERIAL', 'EXIT_EXAM', null], default: null },
  examYear: { type: String, default: null },
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

universityLearningSessionSchema.index({ lastActivityAt:  1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.models.UniversityLearningSession ||
  mongoose.model('UniversityLearningSession', universityLearningSessionSchema);
