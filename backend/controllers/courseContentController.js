const CourseContent = require('../models/CourseContent');
const PaymentPricing = require('../models/PaymentPricing');
const PaymentTransaction = require('../models/PaymentTransaction');
const ReferralCommission = require('../models/ReferralCommission');
const AppSetting = require('../models/AppSetting');
const Department = require('../models/Department');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDirectory = path.join(__dirname, '../uploads');
const exactDepartmentRegex = (value) => new RegExp('^' + String(value || '').trim().replace(/[.*+?^()|[\]\\$]/g, (character) => '\\' + character) + '$', 'i');
fs.mkdirSync(uploadsDirectory, { recursive: true });
const isCourseAdmin = (user) => user?.role === 'admin';
const hasApprovedCourseAccess = (user, courseId) => (user?.downloadApprovals || []).some((entry) =>
  entry.resourceModel === 'CourseContent'
  && String(entry.resourceId) === String(courseId)
  && entry.status === 'approved'
);
const canAccessCourse = (user, course) => !course?.isPremium || isCourseAdmin(user) || hasApprovedCourseAccess(user, course?._id);


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

// Accept PDF, PowerPoint, and browser-playable local video formats.
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  const extension = path.extname(file.originalname || '').toLowerCase();
  const allowedVideoExtension = ['.mp4', '.webm', '.ogv', '.ogg'].includes(extension);
  if (allowedMimes.includes(file.mimetype) && (!file.mimetype.startsWith('video/') || allowedVideoExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Allowed files: PDF, PPT/PPTX, MP4, WebM, and OGG video.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // Up to 500MB per file; configure hosting limits accordingly.
  }
});

// Upload course content (create or update)
const uploadContent = async (req, res) => {
  try {
    const {
      level = 'university', university = '', department = '', year = '',
      grade = '', subject = '', technology = '', faculty = '', studyStage: requestedStudyStage = '', contentType = 'course-materials', courseCode = '', course, description,
      notes, videos, ppts, questions, isActive, isPremium, language = 'en'
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
        let configuredDepartment = null;
        if (studyStage === 'Senior') {
          configuredDepartment = await Department.findOne({ name: { $regex: exactDepartmentRegex(department) }, category: faculty, isActive: true }).select('name').lean();
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
    if (parsedVideos.some((item) => !String(item?.title || '').trim() || (!String(item?.url || '').trim() && item?.fileUpload !== true))) {
      return res.status(400).json({ success: false, message: 'Every video must have a title and either a video URL or uploaded video file.' });
    }
    if (parsedQuestions.some((item) => !String(item?.question || '').trim() || !String(item?.answer || '').trim())) {
      return res.status(400).json({ success: false, message: 'Every exam question must include both a question and an answer.' });
    }

    // Match each uploaded file to its material by MIME type and selection order.
    let noteFileIndex = 0;
    let pptFileIndex = 0;
    let videoFileIndex = 0;
    const localVideoEntries = parsedVideos.filter((item) => item.fileUpload === true);
    (req.files || []).forEach((file) => {
      const isVideo = String(file.mimetype || '').startsWith('video/');
      const isPpt = file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation');
      if (isVideo && localVideoEntries[videoFileIndex]) {
        localVideoEntries[videoFileIndex].url = `/uploads/${file.filename}`;
        localVideoEntries[videoFileIndex].mimeType = file.mimetype;
        delete localVideoEntries[videoFileIndex].fileUpload;
        videoFileIndex += 1;
      } else if (isPpt && parsedPpts[pptFileIndex]) {
        parsedPpts[pptFileIndex].fileUrl = `/uploads/${file.filename}`;
        pptFileIndex += 1;
      } else if (file.mimetype === 'application/pdf' && parsedNotes[noteFileIndex]) {
        parsedNotes[noteFileIndex].fileUrl = `/uploads/${file.filename}`;
        noteFileIndex += 1;
      }
    });

    if (noteFileIndex !== parsedNotes.length || pptFileIndex !== parsedPpts.length || videoFileIndex !== localVideoEntries.length) {
      return res.status(400).json({ success: false, message: 'A selected PDF, PowerPoint, or video file is missing or does not match its material entry. Please reselect the files and try again.' });
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
      language: String(language).trim().toLowerCase() === 'am' || String(language).trim().toLowerCase() === 'amharic' ? 'am' : 'en',
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
    const { level, university, department, year, grade, subject, technology, faculty, studyStage, contentType, course, courseCode, language } = req.query;

    // Build a tolerant query for legacy uploads while keeping inactive content hidden.
    const query = { isActive: { $ne: false } };
    if (String(language || '').trim().toLowerCase() === 'am' || String(language || '').trim().toLowerCase() === 'amharic') query.language = 'am';
    const addAnd = (condition) => { query.$and = [...(query.$and || []), condition]; };
    if (level) query.level = { $regex: exactDepartmentRegex(level) };
    if (university) query.university = { $regex: exactDepartmentRegex(university) };
    if (grade) {
      const selectedGrade = String(grade).trim();
      addAnd({ $or: [
        { grade: { $regex: exactDepartmentRegex(selectedGrade) } },
        { year: { $regex: exactDepartmentRegex(`Grade ${selectedGrade}`) } },
        { year: { $regex: exactDepartmentRegex(selectedGrade) } },
      ] });
    }
    if (subject) query.subject = { $regex: exactDepartmentRegex(subject) };
    if (technology) query.technology = { $regex: exactDepartmentRegex(technology) };
    if (faculty) query.faculty = { $regex: exactDepartmentRegex(faculty) };
    if (studyStage) query.studyStage = { $regex: exactDepartmentRegex(studyStage) };
    if (contentType === 'course-materials') addAnd({ $or: [
      { contentType: { $regex: exactDepartmentRegex('course-materials') } },
      { contentType: { $exists: false } },
      { contentType: null },
      { contentType: '' },
    ] });
    else if (contentType) query.contentType = { $regex: exactDepartmentRegex(contentType) };
    if (courseCode) query.courseCode = { $regex: String(courseCode).trim(), $options: 'i' };
    if (department) query.department = { $regex: exactDepartmentRegex(department) };
    if (year) addAnd({ $or: [
      { year: { $regex: exactDepartmentRegex(year) } },
      { year: { $regex: exactDepartmentRegex('All Years') } },
      { year: '' }, { year: null }, { year: { $exists: false } },
    ] });
    if (course) query.course = { $regex: exactDepartmentRegex(course) };


    const content = await CourseContent.find(query).lean();
    const isAdmin = req.user?.role === 'admin';
    const unlockedIds = new Set((req.user?.unlockedCourseContents || []).map((id) => String(id)));
    const approvedIds = new Set((req.user?.downloadApprovals || []).filter((entry) => entry.resourceModel === 'CourseContent' && entry.status === 'approved').map((entry) => String(entry.resourceId)));
    content.forEach((item) => {
      item.pricingTier = String(item.faculty || '').toLowerCase() === 'phd' ? 'phd' : ['elementary', 'highschool'].includes(String(item.level || '').toLowerCase()) ? String(item.level).toLowerCase() : String(item.level || '').toLowerCase() === 'coding' ? 'general' : 'university';
      item.hasAccess = !item.isPremium || isAdmin || approvedIds.has(String(item._id));
    });
    // Never expose protected file URLs or lesson links for locked Premium courses.
    content.forEach((item) => {
      if (item.isPremium && !item.hasAccess) {
        item.notes = (item.notes || []).map(({ title }) => ({ title }));
        item.ppts = (item.ppts || []).map(({ title }) => ({ title }));
        item.videos = (item.videos || []).map(({ title }) => ({ title }));
        item.questions = [];
      } else {
        item.notes = (item.notes || []).map(({ title }) => ({ title }));
        item.ppts = (item.ppts || []).map(({ title }) => ({ title }));
      }
    });
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

    if (!content || !content.isActive || (req.user?.preferences?.language === 'am' && content.language !== 'am')) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    const pricingTier = String(content.faculty || '').toLowerCase() === 'phd' ? 'phd' : ['elementary', 'highschool'].includes(String(content.level || '').toLowerCase()) ? String(content.level).toLowerCase() : String(content.level || '').toLowerCase() === 'coding' ? 'general' : 'university';
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(content._id));
    const isApproved = (req.user?.downloadApprovals || []).some((entry) => entry.resourceModel === 'CourseContent' && String(entry.resourceId) === String(content._id) && entry.status === 'approved');
    if (content.isPremium && !isAdmin && !isUnlocked && !isApproved) {
      return res.status(200).json({
        success: true,
        accessLocked: true,
        message: 'This premium course is locked. Please contact the administrator for approval.',
        data: { ...content.toObject(), pricingTier, notes: [], videos: [], ppts: [], questions: [] }
      });
    }

    const safeContent = content.toObject();
    safeContent.pricingTier = pricingTier;
    safeContent.notes = (safeContent.notes || []).map(({ title }) => ({ title }));
    safeContent.ppts = (safeContent.ppts || []).map(({ title }) => ({ title }));
    res.status(200).json({
      success: true,
      accessLocked: false,
      data: safeContent
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
    const isApproved = req.user?.downloadApprovals?.some((entry) => entry.resourceModel === 'CourseContent' && String(entry.resourceId) === String(course._id) && entry.status === 'approved');
    if (req.query.download === '1' && !isAdmin && !isUnlocked && !isApproved) return res.status(403).json({ success: false, message: 'Administrator approval is required before downloading this course material.' });
    if (req.query.download !== '1' && course.isPremium && !isAdmin && !isUnlocked && !isApproved) return res.status(403).json({ success: false, message: 'Administrator approval is required to view this premium course.' });
    if (!['notes', 'ppts'].includes(kind)) return res.status(400).json({ success: false, message: 'Unsupported material type.' });
    const item = course[kind]?.[Number(index)];
    if (!item?.fileUrl || !item.fileUrl.startsWith('/uploads/')) return res.status(404).json({ success: false, message: 'Material file not found.' });
    const filePath = path.join(uploadsDirectory, path.basename(item.fileUrl));
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Material file is missing from the server.' });
    if (req.query.download === '1') return res.download(filePath, path.basename(item.fileUrl));
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Stream course material error:', error);
    return res.status(500).json({ success: false, message: 'Unable to open course material.' });
  }
};

// Deliver an approved course video only after verifying the student's per-course download approval.
const downloadCourseVideo = async (req, res) => {
  try {
    const course = await CourseContent.findById(req.params.id);
    if (!course || !course.isActive) return res.status(404).json({ success: false, message: 'Course not found.' });
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = req.user?.unlockedCourseContents?.some((item) => String(item) === String(course._id));
    const isApproved = req.user?.downloadApprovals?.some((entry) => entry.resourceModel === 'CourseContent' && String(entry.resourceId) === String(course._id) && entry.status === 'approved');
    if (!isAdmin && !isUnlocked && !isApproved) return res.status(403).json({ success: false, message: 'Administrator approval is required before downloading this course video.' });
    const video = course.videos?.[Number(req.params.index)];
    if (!video?.url) return res.status(404).json({ success: false, message: 'Video not found.' });
    if (String(video.url).startsWith('/uploads/')) {
      const filePath = path.join(uploadsDirectory, path.basename(video.url));
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'Uploaded video file is missing from the server.' });
      res.type(video.mimeType || 'video/mp4');
      if (req.query.download === '1') return res.download(filePath, path.basename(filePath));
      return res.sendFile(filePath);
    }
    let target;
    try { target = new URL(video.url); } catch { return res.status(400).json({ success: false, message: 'Video URL is invalid.' }); }
    if (!['http:', 'https:'].includes(target.protocol)) return res.status(400).json({ success: false, message: 'Unsupported video URL.' });
    return res.redirect(302, target.toString());
  } catch (error) {
    console.error('Download course video error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify video download.' });
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

// Toggle Free/Premium access for an existing course (admin only).
const toggleCoursePremium = async (req, res) => {
  try {
    const course = await CourseContent.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    course.isPremium = typeof req.body.isPremium === 'boolean' ? req.body.isPremium : !course.isPremium;
    await course.save();
    return res.json({ success: true, message: course.isPremium ? 'Course marked Premium.' : 'Course set to Free.', data: course });
  } catch (error) {
    console.error('Toggle course premium error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update course access type.' });
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
  let payment = null;
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Student is required.' });
    const [course, User] = await Promise.all([
      CourseContent.findById(req.params.id),
      Promise.resolve(require('../models/User'))
    ]);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const student = await User.findById(userId);
    if (!student || student.role === 'admin') return res.status(404).json({ success: false, message: 'Student account not found.' });

    let commissionRecords = [];
    let transactionReference = '';
    let amountETB = 0;
    if (course.isPremium) {
      transactionReference = String(req.body.transactionReference || '').trim().toUpperCase();
      if (transactionReference.length < 5 || transactionReference.length > 80 || !/^[A-Z0-9][A-Z0-9._/-]*$/.test(transactionReference)) {
        return res.status(400).json({ success: false, message: 'Enter the verified bank/Telebirr transaction reference (5–80 letters, numbers, or . _ / -).' });
      }
      const duplicate = await PaymentTransaction.findOne({ transactionReference }).select('_id');
      if (duplicate) return res.status(409).json({ success: false, message: 'This transaction reference has already been used.' });

      const tier = String(course.faculty || '').toLowerCase() === 'phd'
        ? 'phd'
        : ['elementary', 'highschool'].includes(String(course.level || '').toLowerCase())
          ? String(course.level).toLowerCase()
          : String(course.level || '').toLowerCase() === 'coding' ? 'general' : 'university';
      const pricing = await PaymentPricing.findOne({ key: 'default' }).lean();
      amountETB = Number(pricing?.tiers?.find((item) => item.tier === tier)?.amountETB);
      if (!Number.isFinite(amountETB) || amountETB <= 0) {
        return res.status(400).json({ success: false, message: 'A valid paid course price must be configured before confirming this premium-course payment.' });
      }

      payment = await PaymentTransaction.create({
        transactionReference,
        payer: student._id,
        course: course._id,
        amountETB,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      });

      const ratesSetting = await AppSetting.findOne({ key: 'referralCommissionRates' }).select('value').lean();
      const rates = ratesSetting?.value || { direct: 10, indirect: 5 };
      const referrer = student.referrer ? await User.findById(student.referrer).select('_id referrer role') : null;
      const indirectReferrer = referrer?.referrer ? await User.findById(referrer.referrer).select('_id role') : null;
      const commissionCandidates = [
        { beneficiary: referrer, level: 1, percent: Number(rates.direct ?? 10) },
        { beneficiary: indirectReferrer, level: 2, percent: Number(rates.indirect ?? 5) },
      ];
      commissionRecords = commissionCandidates
        .filter((item) => item.beneficiary && item.beneficiary.role !== 'admin' && Number.isFinite(item.percent) && item.percent > 0)
        .map((item) => ({
          payment: payment._id,
          transactionReference,
          payer: student._id,
          beneficiary: item.beneficiary._id,
          level: item.level,
          paidAmountETB: amountETB,
          commissionPercent: item.percent,
          commissionETB: Number((amountETB * item.percent / 100).toFixed(2)),
        }));
      if (commissionRecords.length) await ReferralCommission.insertMany(commissionRecords);
    }

    student.downloadApprovals = (student.downloadApprovals || []).filter((entry) => !(entry.resourceModel === 'CourseContent' && String(entry.resourceId) === String(course._id)));
    student.downloadApprovals.push({
      resourceModel: 'CourseContent',
      resourceId: course._id,
      status: 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
      ...(payment ? { paymentTransaction: payment._id, transactionReference, amountETB } : {}),
    });
    student.unlockedCourseContents = (student.unlockedCourseContents || []).filter((id) => String(id) !== String(course._id));
    await student.save();
    return res.json({
      success: true,
      message: course.isPremium
        ? 'Payment verified and premium course access approved. Eligible referral commissions were recorded.'
        : 'Free course access approved. No referral commission was generated.',
      payment: payment ? { transactionReference, amountETB } : null,
    });
  } catch (error) {
    if (payment?._id) {
      await ReferralCommission.deleteMany({ payment: payment._id }).catch(() => undefined);
      await PaymentTransaction.deleteOne({ _id: payment._id }).catch(() => undefined);
    }
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'This transaction reference has already been used.' });
    console.error('Verify payment and unlock premium course error:', error);
    return res.status(500).json({ success: false, message: 'Unable to verify payment and approve course access.' });
  }
};

const getStudentsForPremiumAccess = async (_req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: { $ne: 'admin' } }).select('fullName email role unlockedCourseContents downloadApprovals').sort({ fullName: 1 }).lean();
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
    student.downloadApprovals = (student.downloadApprovals || []).filter((entry) => !(entry.resourceModel === 'CourseContent' && String(entry.resourceId) === String(req.params.id)));
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
  downloadCourseVideo,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  toggleCoursePremium,
  updateCourse
};