const mongoose = require('mongoose');
const Session = require('../models/UniversityLearningSession');
const Department = require('../models/Department');
const CourseContent = require('../models/CourseContent');

const STREAMS = ['Natural Science', 'Social Science'];
const LEVELS = ['Freshman', 'Remedial', 'Senior'];

const clearBelowLevel = {
  departmentId: null,
  departmentName: null,
  courseId: null,
  learningType: null,
  examYear: null
};

async function getSession(userId) {
  const session = await Session.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId, state: 'SELECT_STREAM' },
      $set: { lastActivityAt: new Date() }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // Repair stale/inconsistent state left by older navigation flows.
  const validStream = STREAMS.includes(session.stream);
  const junior = ['Freshman', 'Remedial'].includes(session.level);
  const senior = session.level === 'Senior';
  const seniorNeedsDepartment = [
    'SENIOR_LEARNING_TYPE', 'SENIOR_EXIT_EXAM',
    'SENIOR_COURSES', 'SENIOR_MATERIALS'
  ].includes(session.state);
  const juniorStates = [
    'JUNIOR_COURSES', 'JUNIOR_LEARNING_TYPE', 'EXAM_YEAR',
    'EXAM_QUESTIONS', 'JUNIOR_MATERIALS'
  ];
  let repaired = false;

  if (!validStream) {
    Object.assign(session, {
      state: 'SELECT_STREAM', stream: null, level: null,
      ...clearBelowLevel
    });
    repaired = true;
  } else if (session.state === 'SELECT_STREAM') {
    session.state = 'SELECT_LEVEL';
    repaired = true;
  } else if (session.state === 'SELECT_LEVEL') {
    if (session.level) session.level = null;
    repaired = true;
  } else if (session.state === 'SENIOR_DEPARTMENTS' && !senior) {
    Object.assign(session, { state: 'SELECT_LEVEL', level: null, ...clearBelowLevel });
    repaired = true;
  } else if (seniorNeedsDepartment && (!senior || !session.departmentId || !session.departmentName)) {
    Object.assign(session, {
      state: senior ? 'SENIOR_DEPARTMENTS' : 'SELECT_LEVEL',
      ...(senior ? {} : { level: null }),
      departmentId: null, departmentName: null, courseId: null,
      learningType: null, examYear: null
    });
    repaired = true;
  } else if (juniorStates.includes(session.state) && !junior) {
    Object.assign(session, { state: 'SELECT_LEVEL', level: null, ...clearBelowLevel });
    repaired = true;
  } else if (session.state === 'JUNIOR_COURSES' && junior) {
    session.courseId = null;
    session.learningType = null;
    session.examYear = null;
    repaired = true;
  }

  if (repaired) {
    session.lastActivityAt = new Date();
    await session.save();
  }
  return session;
}

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

exports.get = async (req, res) => {
  try {
    const session = await getSession(req.user._id);
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University session load:', error);
    return fail(res, 500, 'Unable to load University learning session.');
  }
};

exports.reset = async (req, res) => {
  try {
    const session = await getSession(req.user._id);
    Object.assign(session, {
      state: 'SELECT_STREAM', stream: null, level: null,
      ...clearBelowLevel, lastActivityAt: new Date()
    });
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University session reset:', error);
    return fail(res, 500, 'Unable to restart University learning.');
  }
};

exports.selectStream = async (req, res) => {
  const { stream } = req.body;
  if (!STREAMS.includes(stream)) return fail(res, 400, 'Select Natural Science or Social Science.');
  try {
    const session = await getSession(req.user._id);
    Object.assign(session, {
      stream, level: null, ...clearBelowLevel,
      state: 'SELECT_LEVEL', lastActivityAt: new Date()
    });
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University stream selection:', error);
    return fail(res, 500, 'Unable to save stream selection.');
  }
};

exports.selectLevel = async (req, res) => {
  const { level } = req.body;
  if (!LEVELS.includes(level)) return fail(res, 400, 'Select Freshman, Remedial, or Senior.');
  try {
    const session = await getSession(req.user._id);
    if (session.state !== 'SELECT_LEVEL' || !session.stream) return fail(res, 409, 'Select your stream first.');
    Object.assign(session, {
      level, ...clearBelowLevel,
      state: level === 'Senior' ? 'SENIOR_DEPARTMENTS' : 'JUNIOR_COURSES',
      lastActivityAt: new Date()
    });
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University level selection:', error);
    return fail(res, 500, 'Unable to save academic level.');
  }
};

exports.selectDepartment = async (req, res) => {
  const { departmentId } = req.body;
  if (!mongoose.isValidObjectId(departmentId)) return fail(res, 400, 'Select a valid department.');
  try {
    const session = await getSession(req.user._id);
    if (session.state !== 'SENIOR_DEPARTMENTS' || session.level !== 'Senior') {
      return fail(res, 409, 'Department selection is not available in this state.');
    }
    const department = await Department.findOne({
      _id: departmentId, category: session.stream, isActive: true
    }).select('_id name');
    if (!department) return fail(res, 404, 'This department is not active in the selected stream.');
    Object.assign(session, {
      departmentId: department._id, departmentName: department.name,
      courseId: null, learningType: null, examYear: null,
      state: 'SENIOR_LEARNING_TYPE', lastActivityAt: new Date()
    });
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University department selection:', error);
    return fail(res, 500, 'Unable to save department selection.');
  }
};

exports.selectCourse = async (req, res) => {
  const { courseId } = req.body;
  if (!mongoose.isValidObjectId(courseId)) return fail(res, 400, 'Select a valid course.');
  try {
    const session = await getSession(req.user._id);
    const juniorState = session.state === 'JUNIOR_COURSES' &&
      ['Freshman', 'Remedial'].includes(session.level);
    const seniorState = session.state === 'SENIOR_COURSES' && session.level === 'Senior';
    if (!juniorState && !seniorState) return fail(res, 409, 'Course selection is not available in this state.');

    const query = {
      _id: courseId, level: 'university', faculty: session.stream,
      studyStage: session.level, isActive: true
    };
    if (seniorState) query.department = session.departmentName;
    const course = await CourseContent.findOne(query).select('_id');
    if (!course) return fail(res, 404, 'Course not found for this learning path.');

    session.courseId = course._id;
    session.learningType = null;
    session.examYear = null;
    session.state = juniorState ? 'JUNIOR_LEARNING_TYPE' : 'SENIOR_MATERIALS';
    session.lastActivityAt = new Date();
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University course selection:', error);
    return fail(res, 500, 'Unable to select course.');
  }
};

exports.selectLearningType = async (req, res) => {
  const { learningType } = req.body;
  try {
    const session = await getSession(req.user._id);
    const junior = session.state === 'JUNIOR_LEARNING_TYPE' &&
      ['Freshman', 'Remedial'].includes(session.level);
    const senior = session.state === 'SENIOR_LEARNING_TYPE' && session.level === 'Senior';
    const allowed = junior
      ? ['EXAM_QUESTION', 'COURSE_MATERIAL']
      : senior
        ? ['EXIT_EXAM', 'COURSE_MATERIAL']
        : [];
    if (!allowed.includes(learningType)) return fail(res, 400, 'This option is not available for the selected academic level.');

    session.learningType = learningType;
    session.examYear = null;
    if (junior) session.state = learningType === 'EXAM_QUESTION' ? 'EXAM_YEAR' : 'JUNIOR_MATERIALS';
    else session.state = learningType === 'EXIT_EXAM' ? 'SENIOR_EXIT_EXAM' : 'SENIOR_COURSES';
    session.lastActivityAt = new Date();
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University learning type selection:', error);
    return fail(res, 500, 'Unable to save learning selection.');
  }
};

exports.selectExamYear = async (req, res) => {
  const examYear = String(req.body.examYear || '').trim();
  if (!/^20\d{2}$/.test(examYear)) return fail(res, 400, 'Select a valid academic year.');
  try {
    const session = await getSession(req.user._id);
    if (session.state !== 'EXAM_YEAR' || session.learningType !== 'EXAM_QUESTION') {
      return fail(res, 409, 'Exam year selection is not available now.');
    }
    session.examYear = examYear;
    session.state = 'EXAM_QUESTIONS';
    session.lastActivityAt = new Date();
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University exam year selection:', error);
    return fail(res, 500, 'Unable to save exam year.');
  }
};

exports.back = async (req, res) => {
  try {
    const session = await getSession(req.user._id);
    const back = {
      SELECT_LEVEL: { state: 'SELECT_STREAM', stream: null, level: null, ...clearBelowLevel },
      JUNIOR_COURSES: { state: 'SELECT_LEVEL', level: null, ...clearBelowLevel },
      SENIOR_DEPARTMENTS: { state: 'SELECT_LEVEL', level: null, ...clearBelowLevel },
      JUNIOR_LEARNING_TYPE: {
        state: 'JUNIOR_COURSES', courseId: null, learningType: null, examYear: null
      },
      EXAM_YEAR: { state: 'JUNIOR_LEARNING_TYPE', learningType: null, examYear: null },
      EXAM_QUESTIONS: { state: 'EXAM_YEAR', examYear: null },
      JUNIOR_MATERIALS: { state: 'JUNIOR_LEARNING_TYPE', learningType: null },
      SENIOR_LEARNING_TYPE: {
        state: 'SENIOR_DEPARTMENTS', departmentId: null, departmentName: null,
        learningType: null, courseId: null
      },
      SENIOR_EXIT_EXAM: { state: 'SENIOR_LEARNING_TYPE', learningType: null },
      SENIOR_COURSES: { state: 'SENIOR_LEARNING_TYPE', learningType: null, courseId: null },
      SENIOR_MATERIALS: { state: 'SENIOR_COURSES', courseId: null }
    };
    const patch = back[session.state];
    if (!patch) return fail(res, 409, 'There is no previous menu.');
    Object.assign(session, patch, { lastActivityAt: new Date() });
    await session.save();
    return res.json({ success: true, data: session });
  } catch (error) {
    console.error('University session back:', error);
    return fail(res, 500, 'Unable to return to the previous menu.');
  }
};
