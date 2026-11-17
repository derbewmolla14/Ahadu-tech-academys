const CourseContent = require('../models/CourseContent');
const Department = require('../models/Department');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDirectory = path.join(__dirname, '../uploads');
const exactDepartmentRegex = (value) => new RegExp('^' + String(value || '').trim().replace(/[.*+?^()|[\]\\$]/g, '\\const uploadsDirectory = path.join(__dirname, '../uploads');') + '
fs.mkdirSync(uploadsDirectory, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow PDF and PPT files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and PPT files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload course content (create or update)
const uploadContent = async (req, res) => {
  try {
    const {
      level = 'university', university = '', department = '', year = '',
      grade = '', subject = '', technology = '', faculty = '', studyStage: requestedStudyStage = '', contentType = 'course-materials', courseCode = '', course, description,
      notes, videos, ppts, questions, isActive, isPremium
    } = req.body;

    let studyStage = requestedStudyStage;

    if (!['elementary', 'highschool', 'university', 'coding'].includes(level)) {
      return res.status(400).json({ success: false, message: 'Please select a valid course category' });
    }
    const normalizedCourse = String(course || '').trim();
    if (!normalizedCourse) {
      return res.status(400).json({ success: false, message: 'Please enter the course name.' });
    }

    // Keep the legacy university/department/year fields populated so older
    // course browsing pages and the existing unique index remain compatible.
    let recordUniversity = university;
    let recordDepartment = department;
    let recordYear = year;
    if (level === 'elementary') {
      if (!String(grade || '').trim()) return res.status(400).json({ success: false, message: 'Please select an Elementary grade.' });
      if (!String(subject || '').trim()) return res.status(400).json({ success: false, message: 'Please enter the Elementary subject.' });
      recordUniversity = 'Elementary';
      recordDepartment = subject;
      recordYear = `Grade ${grade}`;
    } else if (level === 'highschool') {
      if (!String(grade || '').trim()) return res.status(400).json({ success: false, message: 'Please select a High School grade.' });
      if (!String(subject || '').trim()) return res.status(400).json({ success: false, message: 'Please enter the High School subject.' });
      recordUniversity = 'High School';
      recordDepartment = subject;
      recordYear = `Grade ${grade}`;
    } else if (level === 'university') {
      if (!['Natural Science', 'Social Science', 'Health Science', 'Diploma', "Master's Degree", 'PhD'].includes(String(faculty || '').trim())) return res.status(400).json({ success: false, message: 'Please select an Academic Category.' });
      // Include faculty in the legacy unique-key field so identical course names can exist in different academic categories.
      recordUniversity = 'University - ' + faculty;
      if (faculty === 'Natural Science' || faculty === 'Social Science' || faculty === 'Health Science' || faculty === 'Diploma') {
        if (!['Remedial', 'Freshman', 'Senior', 'Diploma'].includes(String(studyStage || '').trim())) return res.status(400).json({ success: false, message: 'Please select an Academic Stage.' });
        if (studyStage === 'Senior' && !String(department || '').trim()) return res.status(400).json({ success: false, message: 'Please select a Department.' });
        if (studyStage === 'Senior' && !['course-materials', 'exit-exam'].includes(contentType)) return res.status(400).json({ success: false, message: 'Select Course Materials or Exit Exam.' });
        if (studyStage === 'Senior') {
          const configuredDepartment = await Department.findOne({ name: { $regex: exactDepartmentRegex(department) }, category: faculty, isActive: true }).select('name').lean();
          if (!configuredDepartment) return res.status(400).json({ success: false, message: 'Select an active department from the selected academic category.' });
        }
        recordDepartment = studyStage === 'Senior' ? configuredDepartment.name : 'General';
        recordYear = studyStage === 'Senior' ? (String(year || '').trim() || 'All Years') : studyStage;
      } else {
        recordDepartment = department || 'Graduate Studies';
        recordYear = faculty === 'PhD' ? 'PhD' : 'Masters';
        studyStage = faculty === 'PhD' ? 'PhD' : 'Masters';
      }
    } else {
      if (!String(technology || '').trim()) return res.status(400).json({ success: false, message: 'Please select a Training Area.' });
      recordUniversity = 'Other Skills & Trainings';
      recordDepartment = technology;
      recordYear = year || 'All Levels';
    }

    let parsedNotes = [];
    let parsedVideos = [];
    let parsedPpts = [];
    let parsedQuestions = [];
    try {
      parsedNotes = notes ? (typeof notes === 'string' ? JSON.parse(notes) : notes) : [];
      parsedVideos = videos ? (typeof videos === 'string' ? JSON.parse(videos) : videos) : [];
      parsedPpts = ppts ? (typeof ppts === 'string' ? JSON.parse(ppts) : ppts) : [];
      parsedQuestions = questions ? (typeof questions === 'string' ? JSON.parse(questions) : questions) : [];
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Course materials contain invalid JSON. Please review the notes, videos, presentations, and questions.' });
    }

    if (![parsedNotes, parsedVideos, parsedPpts, parsedQuestions].every(Array.isArray)) {
      return res.status(400).json({ success: false, message: 'Course materials must be submitted as valid lists.' });
    }
    if (parsedNotes.some((item) => !String(item?.title || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every PDF note must have a title.' });
    }
    if (parsedPpts.some((item) => !String(item?.title || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every PowerPoint presentation must have a title.' });
    }
    if (parsedVideos.some((item) => !String(item?.title || '').trim() || !String(item?.url || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every video must have both a title and a video URL.' });
    }
    if (parsedQuestions.some((item) => !String(item?.question || '').trim() || !String(item?.answer || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every exam question must include both a question and an answer.' });
    }

    // Match uploaded files to their note/PPT entries in the order selected.
    let noteFileIndex = 0;
    let pptFileIndex = 0;
    (req.files || []).forEach((file) => {
      const isPpt = file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation');
      if (isPpt && parsedPpts[pptFileIndex]) {
        parsedPpts[pptFileIndex].fileUrl = `/uploads/${file.filename}`;
        pptFileIndex += 1;
      } else if (!isPpt && parsedNotes[noteFileIndex]) {
        parsedNotes[noteFileIndex].fileUrl = `/uploads/${file.filename}`;
        noteFileIndex += 1;
      }
    });

    if (noteFileIndex !== parsedNotes.length || pptFileIndex !== parsedPpts.length) {
      return res.status(400).json({ success: false, message: 'A selected PDF or PowerPoint file is missing or does not match its material entry. Please reselect the files and try again.' });
    }

    const identity = {
      university: String(recordUniversity || '').trim(),
      department: String(recordDepartment || '').trim(),
      year: String(recordYear || '').trim(),
      course: normalizedCourse
    };
    const existingContent = await CourseContent.findOne(identity);
    const values = {
      ...identity,
      level: String(level).trim(),
      grade: String(grade || '').trim(),
      subject: String(subject || '').trim(),
      technology: String(technology || '').trim(),
      faculty: String(faculty || '').trim(),
      studyStage: String(studyStage || '').trim(),
      contentType: studyStage === 'Senior' ? contentType : 'course-materials',
      courseCode: String(courseCode || '').trim(),
      description: String(description || '').trim(),
      notes: parsedNotes,
      videos: parsedVideos,
      ppts: parsedPpts,
      questions: parsedQuestions,
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
      isPremium: isPremium === true || isPremium === 'true'
    };

    let content;
    if (existingContent) {
      Object.assign(existingContent, values);
      content = await existingContent.save();
    } else {
      content = await CourseContent.create(values);
    }

    return res.status(200).json({
      success: true,
      message: existingContent ? 'Course content updated successfully' : 'Course content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Upload content error:', error.stack || error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A course with this name already exists for the selected category and department.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Course information is incomplete or invalid. Please review the course details and materials.', details: Object.values(error.errors).map(item => item.message) });
    }
    return res.status(500).json({ success: false, message: 'Server error while uploading content. Please try again.', error: error.message });
  }
};

// Get course content (public - only active courses)
const getContent = async (req, res) => {
  try {
    const { level, university, department, year, grade, subject, technology, faculty, studyStage, contentType, course, courseCode } = req.query;

    // Build query object - only active courses for public access
    const query = { isActive: true };
    if (level) query.level = level;
    if (university) query.university = university;
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    if (technology) query.technology = technology;
    if (faculty) query.faculty = faculty;
    if (studyStage) query.studyStage = studyStage;
    if (contentType === 'course-materials') query.$or = [{ contentType: 'course-materials' }, { contentType: { $exists: false } }];
    else if (contentType) query.contentType = contentType;
    if (courseCode) query.courseCode = new RegExp(courseCode, 'i');
    if (department) query.department = { $regex: exactDepartmentRegex(department) };
    if (year) query.$or = [
      { year: String(year).trim() },
      { year: 'All Years' },
      { year: '' },
      { year: null },
      { year: { $exists: false } },
    ];
    if (course) query.course = course;

    const content = await CourseContent.find(query).lean();
    // University listings return metadata only; lesson URLs are fetched from the protected detail endpoint.
    if (level === 'university') {
      content.forEach((item) => {
        delete item.notes;
        delete item.videos;
        delete item.ppts;
        delete item.questions;
      });
    }

    res.status(200).json({
      success: true,
      data: content,
      count: content.length
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content',
      error: error.message
    });
  }
};

// Get single course content by ID
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await CourseContent.findById(id);

    if (!content || !content.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(content._id));
    if (content.isPremium && !isAdmin && !isUnlocked) {
      return res.status(200).json({
        success: true,
        accessLocked: true,
        message: 'This premium course is locked. Please contact the administrator for approval.',
        data: { ...content.toObject(), notes: [], videos: [], ppts: [], questions: [] }
      });
    }

    res.status(200).json({
      success: true,
      accessLocked: false,
      data: content
    });

  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content',
      error: error.message
    });
  }
};

// Stream a PDF/PPT only after verifying the student's course access.
const streamCourseMaterial = async (req, res) => {
  try {
    const { id, kind, index } = req.params;
    const course = await CourseContent.findById(id);
    if (!course || !course.isActive) return res.status(404).json({ success: false, message: 'Course not found.' });
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(course._id));
    if (course.isPremium && !isAdmin && !isUnlocked) return res.status(403).json({ success: false, message: 'Administrator approval is required for this premium course.' });
    if (!['notes', 'ppts'].includes(kind)) return res.status(400).json({ success: false, message: 'Unsupported material type.' });
    const item = course[kind]?.[Number(index)];
    if (!item?.fileUrl || !item.fileUrl.startsWith('/uploads/')) return res.status(404).json({ success: false, message: 'Material file not found.' });
    const filePath = path.join(uploadsDirectory, path.basename(item.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Material file is missing from the server.' });
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Stream course material error:', error);
    return res.status(500).json({ success: false, message: 'Unable to open course material.' });
  }
};

// Delete course content
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContent = await CourseContent.findByIdAndDelete(id);

    if (!deletedContent) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting content',
      error: error.message
    });
  }
};

// Get all courses for admin (including inactive)
const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseContent.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses',
      error: error.message
    });
  }
};

// Toggle course active status
const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await CourseContent.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isActive = !course.isActive;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      data: course
    });

  } catch (error) {
    console.error('Toggle course status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling course status',
      error: error.message
    });
  }
};

// Update course details
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course, description, notes, videos, ppts, questions, isActive } = req.body;

    const updatedCourse = await CourseContent.findByIdAndUpdate(
      id,
      {
        ...(course && { course }),
        ...(description !== undefined && { description }),
        ...(notes && { notes }),
        ...(videos && { videos }),
        ...(ppts && { ppts }),
        ...(questions && { questions }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course',
      error: error.message
    });
  }
};


// Admin grants access to one premium course for one student.
const unlockCourseForStudent = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Student is required.' });
    const [course, User] = await Promise.all([
      CourseContent.findById(req.params.id),
      Promise.resolve(require('../models/User'))
    ]);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isPremium) return res.status(400).json({ success: false, message: 'This course is not marked as premium.' });
    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    if (student.role === 'admin') return res.status(400).json({ success: false, message: 'Choose a student account.' });
    const alreadyUnlocked = student.unlockedCourseContents.some((id) => String(id) === String(course._id));
    if (!alreadyUnlocked) {
      student.unlockedCourseContents.push(course._id);
      await student.save();
    }
    return res.json({ success: true, message: 'Premium course approved for this student.' });
  } catch (error) {
    console.error('Unlock premium course error:', error);
    return res.status(500).json({ success: false, message: 'Unable to approve this course.' });
  }
};

const getStudentsForPremiumAccess = async (_req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: { $ne: 'admin' } }).select('fullName email role unlockedCourseContents').sort({ fullName: 1 }).lean();
    return res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get premium access students error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load students.' });
  }
};

const lockCourseForStudent = async (req, res) => {
  try {
    const User = require('../models/User');
    const student = await User.findById(req.params.userId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    student.unlockedCourseContents = student.unlockedCourseContents.filter((id) => String(id) !== String(req.params.id));
    await student.save();
    return res.json({ success: true, message: 'Premium course access revoked.' });
  } catch (error) {
    console.error('Revoke premium course access error:', error);
    return res.status(500).json({ success: false, message: 'Unable to revoke course access.' });
  }
};

module.exports = {
  unlockCourseForStudent,
  lockCourseForStudent,
  getStudentsForPremiumAccess,
  upload,
  uploadContent,
  getContent,
  getContentById,
  streamCourseMaterial,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  updateCourse
};, 'i');
fs.mkdirSync(uploadsDirectory, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow PDF and PPT files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and PPT files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload course content (create or update)
const uploadContent = async (req, res) => {
  try {
    const {
      level = 'university', university = '', department = '', year = '',
      grade = '', subject = '', technology = '', faculty = '', studyStage: requestedStudyStage = '', contentType = 'course-materials', courseCode = '', course, description,
      notes, videos, ppts, questions, isActive, isPremium
    } = req.body;

    let studyStage = requestedStudyStage;

    if (!['elementary', 'highschool', 'university', 'coding'].includes(level)) {
      return res.status(400).json({ success: false, message: 'Please select a valid course category' });
    }
    const normalizedCourse = String(course || '').trim();
    if (!normalizedCourse) {
      return res.status(400).json({ success: false, message: 'Please enter the course name.' });
    }

    // Keep the legacy university/department/year fields populated so older
    // course browsing pages and the existing unique index remain compatible.
    let recordUniversity = university;
    let recordDepartment = department;
    let recordYear = year;
    if (level === 'elementary') {
      if (!String(grade || '').trim()) return res.status(400).json({ success: false, message: 'Please select an Elementary grade.' });
      if (!String(subject || '').trim()) return res.status(400).json({ success: false, message: 'Please enter the Elementary subject.' });
      recordUniversity = 'Elementary';
      recordDepartment = subject;
      recordYear = `Grade ${grade}`;
    } else if (level === 'highschool') {
      if (!String(grade || '').trim()) return res.status(400).json({ success: false, message: 'Please select a High School grade.' });
      if (!String(subject || '').trim()) return res.status(400).json({ success: false, message: 'Please enter the High School subject.' });
      recordUniversity = 'High School';
      recordDepartment = subject;
      recordYear = `Grade ${grade}`;
    } else if (level === 'university') {
      if (!['Natural Science', 'Social Science', 'Health Science', 'Diploma', "Master's Degree", 'PhD'].includes(String(faculty || '').trim())) return res.status(400).json({ success: false, message: 'Please select an Academic Category.' });
      // Include faculty in the legacy unique-key field so identical course names can exist in different academic categories.
      recordUniversity = 'University - ' + faculty;
      if (faculty === 'Natural Science' || faculty === 'Social Science' || faculty === 'Health Science' || faculty === 'Diploma') {
        if (!['Remedial', 'Freshman', 'Senior', 'Diploma'].includes(String(studyStage || '').trim())) return res.status(400).json({ success: false, message: 'Please select an Academic Stage.' });
        if (studyStage === 'Senior' && !String(department || '').trim()) return res.status(400).json({ success: false, message: 'Please select a Department.' });
        if (studyStage === 'Senior' && !['course-materials', 'exit-exam'].includes(contentType)) return res.status(400).json({ success: false, message: 'Select Course Materials or Exit Exam.' });
        if (studyStage === 'Senior') {
          const configuredDepartment = await Department.findOne({ name: String(department).trim(), category: faculty, isActive: true });
          if (!configuredDepartment) return res.status(400).json({ success: false, message: 'Select an active department from the selected academic category.' });
        }
        recordDepartment = studyStage === 'Senior' ? String(department).trim() : 'General';
        recordYear = studyStage === 'Senior' ? (String(year || '').trim() || 'All Years') : studyStage;
      } else {
        recordDepartment = department || 'Graduate Studies';
        recordYear = faculty === 'PhD' ? 'PhD' : 'Masters';
        studyStage = faculty === 'PhD' ? 'PhD' : 'Masters';
      }
    } else {
      if (!String(technology || '').trim()) return res.status(400).json({ success: false, message: 'Please select a Training Area.' });
      recordUniversity = 'Other Skills & Trainings';
      recordDepartment = technology;
      recordYear = year || 'All Levels';
    }

    let parsedNotes = [];
    let parsedVideos = [];
    let parsedPpts = [];
    let parsedQuestions = [];
    try {
      parsedNotes = notes ? (typeof notes === 'string' ? JSON.parse(notes) : notes) : [];
      parsedVideos = videos ? (typeof videos === 'string' ? JSON.parse(videos) : videos) : [];
      parsedPpts = ppts ? (typeof ppts === 'string' ? JSON.parse(ppts) : ppts) : [];
      parsedQuestions = questions ? (typeof questions === 'string' ? JSON.parse(questions) : questions) : [];
    } catch (parseError) {
      return res.status(400).json({ success: false, message: 'Course materials contain invalid JSON. Please review the notes, videos, presentations, and questions.' });
    }

    if (![parsedNotes, parsedVideos, parsedPpts, parsedQuestions].every(Array.isArray)) {
      return res.status(400).json({ success: false, message: 'Course materials must be submitted as valid lists.' });
    }
    if (parsedNotes.some((item) => !String(item?.title || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every PDF note must have a title.' });
    }
    if (parsedPpts.some((item) => !String(item?.title || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every PowerPoint presentation must have a title.' });
    }
    if (parsedVideos.some((item) => !String(item?.title || '').trim() || !String(item?.url || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every video must have both a title and a video URL.' });
    }
    if (parsedQuestions.some((item) => !String(item?.question || '').trim() || !String(item?.answer || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every exam question must include both a question and an answer.' });
    }

    // Match uploaded files to their note/PPT entries in the order selected.
    let noteFileIndex = 0;
    let pptFileIndex = 0;
    (req.files || []).forEach((file) => {
      const isPpt = file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation');
      if (isPpt && parsedPpts[pptFileIndex]) {
        parsedPpts[pptFileIndex].fileUrl = `/uploads/${file.filename}`;
        pptFileIndex += 1;
      } else if (!isPpt && parsedNotes[noteFileIndex]) {
        parsedNotes[noteFileIndex].fileUrl = `/uploads/${file.filename}`;
        noteFileIndex += 1;
      }
    });

    if (noteFileIndex !== parsedNotes.length || pptFileIndex !== parsedPpts.length) {
      return res.status(400).json({ success: false, message: 'A selected PDF or PowerPoint file is missing or does not match its material entry. Please reselect the files and try again.' });
    }

    const identity = {
      university: String(recordUniversity || '').trim(),
      department: String(recordDepartment || '').trim(),
      year: String(recordYear || '').trim(),
      course: normalizedCourse
    };
    const existingContent = await CourseContent.findOne(identity);
    const values = {
      ...identity,
      level: String(level).trim(),
      grade: String(grade || '').trim(),
      subject: String(subject || '').trim(),
      technology: String(technology || '').trim(),
      faculty: String(faculty || '').trim(),
      studyStage: String(studyStage || '').trim(),
      contentType: studyStage === 'Senior' ? contentType : 'course-materials',
      courseCode: String(courseCode || '').trim(),
      description: String(description || '').trim(),
      notes: parsedNotes,
      videos: parsedVideos,
      ppts: parsedPpts,
      questions: parsedQuestions,
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
      isPremium: isPremium === true || isPremium === 'true'
    };

    let content;
    if (existingContent) {
      Object.assign(existingContent, values);
      content = await existingContent.save();
    } else {
      content = await CourseContent.create(values);
    }

    return res.status(200).json({
      success: true,
      message: existingContent ? 'Course content updated successfully' : 'Course content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Upload content error:', error.stack || error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A course with this name already exists for the selected category and department.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Course information is incomplete or invalid. Please review the course details and materials.', details: Object.values(error.errors).map(item => item.message) });
    }
    return res.status(500).json({ success: false, message: 'Server error while uploading content. Please try again.', error: error.message });
  }
};

// Get course content (public - only active courses)
const getContent = async (req, res) => {
  try {
    const { level, university, department, year, grade, subject, technology, faculty, studyStage, contentType, course, courseCode } = req.query;

    // Build query object - only active courses for public access
    const query = { isActive: true };
    if (level) query.level = level;
    if (university) query.university = university;
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    if (technology) query.technology = technology;
    if (faculty) query.faculty = faculty;
    if (studyStage) query.studyStage = studyStage;
    if (contentType === 'course-materials') query.$or = [{ contentType: 'course-materials' }, { contentType: { $exists: false } }];
    else if (contentType) query.contentType = contentType;
    if (courseCode) query.courseCode = new RegExp(courseCode, 'i');
    if (department) query.department = department;
    if (year) query.year = year;
    if (course) query.course = course;

    const content = await CourseContent.find(query).lean();
    // University listings return metadata only; lesson URLs are fetched from the protected detail endpoint.
    if (level === 'university') {
      content.forEach((item) => {
        delete item.notes;
        delete item.videos;
        delete item.ppts;
        delete item.questions;
      });
    }

    res.status(200).json({
      success: true,
      data: content,
      count: content.length
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content',
      error: error.message
    });
  }
};

// Get single course content by ID
const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await CourseContent.findById(id);

    if (!content || !content.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(content._id));
    if (content.isPremium && !isAdmin && !isUnlocked) {
      return res.status(200).json({
        success: true,
        accessLocked: true,
        message: 'This premium course is locked. Please contact the administrator for approval.',
        data: { ...content.toObject(), notes: [], videos: [], ppts: [], questions: [] }
      });
    }

    res.status(200).json({
      success: true,
      accessLocked: false,
      data: content
    });

  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content',
      error: error.message
    });
  }
};

// Stream a PDF/PPT only after verifying the student's course access.
const streamCourseMaterial = async (req, res) => {
  try {
    const { id, kind, index } = req.params;
    const course = await CourseContent.findById(id);
    if (!course || !course.isActive) return res.status(404).json({ success: false, message: 'Course not found.' });
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(course._id));
    if (course.isPremium && !isAdmin && !isUnlocked) return res.status(403).json({ success: false, message: 'Administrator approval is required for this premium course.' });
    if (!['notes', 'ppts'].includes(kind)) return res.status(400).json({ success: false, message: 'Unsupported material type.' });
    const item = course[kind]?.[Number(index)];
    if (!item?.fileUrl || !item.fileUrl.startsWith('/uploads/')) return res.status(404).json({ success: false, message: 'Material file not found.' });
    const filePath = path.join(uploadsDirectory, path.basename(item.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Material file is missing from the server.' });
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Stream course material error:', error);
    return res.status(500).json({ success: false, message: 'Unable to open course material.' });
  }
};

// Delete course content
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContent = await CourseContent.findByIdAndDelete(id);

    if (!deletedContent) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting content',
      error: error.message
    });
  }
};

// Get all courses for admin (including inactive)
const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseContent.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses',
      error: error.message
    });
  }
};

// Toggle course active status
const toggleCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await CourseContent.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.isActive = !course.isActive;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isActive ? 'activated' : 'deactivated'} successfully`,
      data: course
    });

  } catch (error) {
    console.error('Toggle course status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling course status',
      error: error.message
    });
  }
};

// Update course details
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course, description, notes, videos, ppts, questions, isActive } = req.body;

    const updatedCourse = await CourseContent.findByIdAndUpdate(
      id,
      {
        ...(course && { course }),
        ...(description !== undefined && { description }),
        ...(notes && { notes }),
        ...(videos && { videos }),
        ...(ppts && { ppts }),
        ...(questions && { questions }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course',
      error: error.message
    });
  }
};


// Admin grants access to one premium course for one student.
const unlockCourseForStudent = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Student is required.' });
    const [course, User] = await Promise.all([
      CourseContent.findById(req.params.id),
      Promise.resolve(require('../models/User'))
    ]);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isPremium) return res.status(400).json({ success: false, message: 'This course is not marked as premium.' });
    const student = await User.findById(userId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    if (student.role === 'admin') return res.status(400).json({ success: false, message: 'Choose a student account.' });
    const alreadyUnlocked = student.unlockedCourseContents.some((id) => String(id) === String(course._id));
    if (!alreadyUnlocked) {
      student.unlockedCourseContents.push(course._id);
      await student.save();
    }
    return res.json({ success: true, message: 'Premium course approved for this student.' });
  } catch (error) {
    console.error('Unlock premium course error:', error);
    return res.status(500).json({ success: false, message: 'Unable to approve this course.' });
  }
};

const getStudentsForPremiumAccess = async (_req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: { $ne: 'admin' } }).select('fullName email role unlockedCourseContents').sort({ fullName: 1 }).lean();
    return res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get premium access students error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load students.' });
  }
};

const lockCourseForStudent = async (req, res) => {
  try {
    const User = require('../models/User');
    const student = await User.findById(req.params.userId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    student.unlockedCourseContents = student.unlockedCourseContents.filter((id) => String(id) !== String(req.params.id));
    await student.save();
    return res.json({ success: true, message: 'Premium course access revoked.' });
  } catch (error) {
    console.error('Revoke premium course access error:', error);
    return res.status(500).json({ success: false, message: 'Unable to revoke course access.' });
  }
};

module.exports = {
  unlockCourseForStudent,
  lockCourseForStudent,
  getStudentsForPremiumAccess,
  upload,
  uploadContent,
  getContent,
  getContentById,
  streamCourseMaterial,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  updateCourse
};