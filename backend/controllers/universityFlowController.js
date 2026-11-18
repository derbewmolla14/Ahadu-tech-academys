const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const UniversityResource = require('../models/UniversityResource');
const CourseContent = require('../models/CourseContent');
const Department = require('../models/Department');
const User = require('../models/User');

const PRIVATE_DIR = path.join(__dirname, '../private_uploads/university');
fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const approvedCondition = { $or: [{ status: 'approved' }, { status: { $exists: false } }, { status: null }, { status: '' }] };
const isAmharicRequest = (language) => ['am', 'amharic', 'አማርኛ'].includes(String(language || '').trim().toLowerCase());
const legacyLanguageCondition = (language) => isAmharicRequest(language)
  ? { $or: [{ language: 'am' }, { language: { $exists: false } }, { language: null }, { language: '' }] }
  : null;
const addAndCondition = (query, condition) => {
  if (!condition) return;
  query.$and = [...(query.$and || []), condition];
};

const STREAM_CATEGORY = { Natural: 'Natural Science', Social: 'Social Science', Health: 'Health Science', Diploma: 'Diploma' };
const exactDepartmentRegex = (value) => new RegExp('^' + String(value || '').trim().replace(/[.*+?^()|[\]\\$]/g, (character) => '\\' + character) + '$', 'i');

const resolveDepartment = async (stream, departmentName) => {
  const category = STREAM_CATEGORY[stream];
  const name = String(departmentName || '').trim();
  if (!category || !name) return null;
  return Department.findOne({ category: { $regex: exactDepartmentRegex(category) }, name: { $regex: exactDepartmentRegex(name) }, isActive: true })
    .select('name normalizedName category').lean();
};

exports.getCatalog = async (req, res) => {
  try {
    const { stream, level, department, course, kind, academicYear, language } = req.query;
    if (!stream) return res.status(400).json({ message: 'Choose a valid academic stream.' });
    const normalizedStream = Object.keys(STREAM_CATEGORY).find((key) => key.toLowerCase() === String(stream).trim().toLowerCase());
    const normalizedLevel = ['Freshman', 'Remedial', 'Senior', 'Diploma'].find((value) => value.toLowerCase() === String(level || '').trim().toLowerCase());
    if (!normalizedStream) return res.status(400).json({ message: 'Choose a valid academic stream.' });
    if (level && !normalizedLevel) return res.status(400).json({ message: 'Invalid academic level.' });
    const selectedStream = normalizedStream;
    const selectedLevel = normalizedLevel;
    if (!selectedLevel) return res.json({ streams: ['Natural', 'Social', 'Health', 'Diploma'], levels: ['Freshman', 'Remedial', 'Senior', 'Diploma'] });
    const base = {
      $and: [
        approvedCondition,
        { stream: { $regex: exactDepartmentRegex(selectedStream) } },
        ...(selectedLevel ? [{ level: { $regex: exactDepartmentRegex(selectedLevel) } }] : []),
        ...(legacyLanguageCondition(language) ? [legacyLanguageCondition(language)] : []),
      ],
    };
    let canonicalDepartment = '';
    if (selectedLevel === 'Senior' && department) {
      const departmentRecord = await resolveDepartment(selectedStream, department);
      // Older uploads may reference a department name that is no longer in the active Department list.
      canonicalDepartment = departmentRecord?.name || String(department).trim();
    }
    if (selectedLevel === 'Senior' && !department) {
      const category = STREAM_CATEGORY[selectedStream];
      const [departments, legacyDepartments] = await Promise.all([
        Department.find({ category: { $regex: exactDepartmentRegex(category) }, isActive: true }).select('name').sort({ name: 1 }).lean(),
        CourseContent.distinct('department', {
          level: { $regex: exactDepartmentRegex('university') },
          faculty: { $regex: exactDepartmentRegex(category) },
          studyStage: { $regex: exactDepartmentRegex(selectedLevel) },
          isActive: { $ne: false },
          department: { $nin: ['', null] },
        }),
      ]);
      const names = [...new Set([...departments.map((item) => item.name), ...legacyDepartments].map((name) => String(name || '').trim()).filter(Boolean))];
      return res.json({ departments: names.sort((a, b) => a.localeCompare(b)) });
    }
    if (selectedLevel !== 'Senior' && !course) {
      const legacyBase = {
        level: { $regex: exactDepartmentRegex('university') },
        faculty: { $regex: exactDepartmentRegex(STREAM_CATEGORY[selectedStream]) },
        studyStage: { $regex: exactDepartmentRegex(selectedLevel) },
        isActive: { $ne: false },
      };
      addAndCondition(legacyBase, legacyLanguageCondition(language));
      const [resourceCourses, legacyCourses] = await Promise.all([
        UniversityResource.distinct('course', { ...base, course: { $nin: ['', null] }, kind: { $in: ['course-material', 'exam-question'] } }),
        CourseContent.distinct('course', { ...legacyBase, course: { $nin: ['', null] } }),
      ]);
      const courses = [...new Set([...resourceCourses, ...legacyCourses].map((item) => String(item || '').trim()).filter(Boolean))];
      return res.json({ courses: courses.sort((a, b) => a.localeCompare(b)) });
    }
    if (selectedLevel === 'Senior' && department && !kind) {
      return res.json({ options: [
        { id: 'exit-exam', label: 'Exit Exam' },
        { id: 'course-material', label: 'Course Material' },
      ] });
    }
    if (selectedLevel === 'Senior' && department && kind === 'course-material' && !course) {
      const legacyBase = {
        level: { $regex: exactDepartmentRegex('university') },
        faculty: { $regex: exactDepartmentRegex(STREAM_CATEGORY[selectedStream]) },
        studyStage: { $regex: exactDepartmentRegex('Senior') },
        department: { $regex: exactDepartmentRegex(canonicalDepartment) },
        isActive: { $ne: false },
        course: { $nin: ['', null] },
      };
      addAndCondition(legacyBase, legacyLanguageCondition(language));
      const [resourceCourses, legacyCourses] = await Promise.all([
        UniversityResource.distinct('course', { ...base, department: { $regex: exactDepartmentRegex(canonicalDepartment) }, kind, course: { $nin: ['', null] } }),
        CourseContent.distinct('course', legacyBase),
      ]);
      const courses = [...new Set([...resourceCourses, ...legacyCourses].map((item) => String(item || '').trim()).filter(Boolean))];
      return res.json({ courses: courses.sort((a, b) => a.localeCompare(b)) });
    }
    if (selectedLevel !== 'Senior' && course && !kind) {
      return res.json({ options: [
        { id: 'exam-question', label: 'Exam Question' },
        { id: 'course-material', label: 'Course Material' },
      ] });
    }
    const query = { ...base, $and: [...base.$and] };
    if (department) query.department = { $regex: exactDepartmentRegex(selectedLevel === 'Senior' ? canonicalDepartment : department) };
    if (course) query.course = { $regex: exactDepartmentRegex(course) };
    if (kind) query.kind = { $regex: exactDepartmentRegex(kind) };
    if (academicYear) addAndCondition(query, { $or: [
      { academicYear: { $regex: exactDepartmentRegex(academicYear) } },
      { academicYear: { $regex: exactDepartmentRegex('All Years') } },
      { academicYear: '' }, { academicYear: null }, { academicYear: { $exists: false } },
    ] });

    const legacyQuery = {
      level: { $regex: exactDepartmentRegex('university') },
      faculty: { $regex: exactDepartmentRegex(STREAM_CATEGORY[selectedStream]) },
      studyStage: { $regex: exactDepartmentRegex(selectedLevel) },
      isActive: { $ne: false },
    };
    addAndCondition(legacyQuery, legacyLanguageCondition(language));
    if (selectedLevel === 'Senior' && department) legacyQuery.department = { $regex: exactDepartmentRegex(canonicalDepartment) };
    if (course) legacyQuery.course = { $regex: exactDepartmentRegex(course) };
    if (academicYear && selectedLevel === 'Senior') {
      addAndCondition(legacyQuery, { $or: [
        { year: { $regex: exactDepartmentRegex(academicYear) } },
        { year: { $regex: exactDepartmentRegex('All Years') } },
        { year: '' },
        { year: null },
        { year: { $exists: false } },
      ] });
    }
    if (kind === 'course-material') legacyQuery.contentType = { $in: ['course-materials', null] };
    else if (kind === 'exit-exam') legacyQuery.contentType = 'exit-exam';
    else if (kind === 'exam-question') legacyQuery._id = null;

    const [resources, legacyCourses] = await Promise.all([
      UniversityResource.find(query)
        .select('title resourceType textContent answer solution originalFileName mimeType accessType')
        .sort({ createdAt: -1 }).lean(),
      CourseContent.find(legacyQuery)
        .select('course description notes videos ppts questions isPremium createdAt')
        .sort({ createdAt: -1 }).lean(),
    ]);

    const unlockedUniversity = new Set((req.user?.unlockedUniversityResources || []).map((id) => String(id)));
    const unlockedCourses = new Set((req.user?.unlockedCourseContents || []).map((id) => String(id)));
    const approvedUniversity = new Set((req.user?.downloadApprovals || []).filter((entry) => entry.resourceModel === 'UniversityResource' && entry.status === 'approved').map((entry) => String(entry.resourceId)));
    const approvedCourses = new Set((req.user?.downloadApprovals || []).filter((entry) => entry.resourceModel === 'CourseContent' && entry.status === 'approved').map((entry) => String(entry.resourceId)));
    const isAdmin = req.user?.role === 'admin';
    const legacyResources = [];

    legacyCourses.forEach((item) => {
      const hasAccess = !item.isPremium || isAdmin || unlockedCourses.has(String(item._id)) || approvedCourses.has(String(item._id));
      if (kind === 'exit-exam') {
        (item.questions || []).forEach((question, index) => {
          legacyResources.push({
            _id: `${item._id}:question:${index}`,
            source: 'course-content',
            courseContentId: String(item._id),
            title: `Question ${index + 1}`,
            resourceType: 'text',
            textContent: question.question,
            answer: question.answer,
            solution: '',
            accessType: item.isPremium ? 'premium' : 'free',
            hasAccess,
          });
        });
        return;
      }
      (item.notes || []).forEach((note, index) => legacyResources.push({
        _id: `${item._id}:notes:${index}`, source: 'course-content',
        courseContentId: String(item._id), materialKind: 'notes', materialIndex: index,
        title: note.title, resourceType: 'pdf', originalFileName: path.basename(note.fileUrl || ''),
        accessType: item.isPremium ? 'premium' : 'free', hasAccess,
      }));
      (item.ppts || []).forEach((ppt, index) => legacyResources.push({
        _id: `${item._id}:ppts:${index}`, source: 'course-content',
        courseContentId: String(item._id), materialKind: 'ppts', materialIndex: index,
        title: ppt.title, resourceType: 'ppt', originalFileName: path.basename(ppt.fileUrl || ''),
        accessType: item.isPremium ? 'premium' : 'free', hasAccess,
      }));
      (item.videos || []).forEach((video, index) => legacyResources.push({
        _id: `${item._id}:videos:${index}`, source: 'course-content',
        courseContentId: String(item._id), materialKind: 'video', materialIndex: index,
        title: video.title, resourceType: 'video', videoUrl: video.url,
        accessType: item.isPremium ? 'premium' : 'free', hasAccess,
      }));
    });

    return res.json({
      resources: [
        ...resources.map((item) => ({
          ...item,
          source: 'university-resource',
          hasAccess: item.accessType !== 'premium' || isAdmin || unlockedUniversity.has(String(item._id)) || approvedUniversity.has(String(item._id)),
        })),
        ...legacyResources,
      ],
    });
  } catch (error) {
    console.error('University catalog error:', error);
    return res.status(500).json({ message: 'Unable to load approved learning content.' });
  }
};

exports.adminUpload = async (req, res) => {
  try {
    const { stream, level, department = '', course = '', kind, academicYear = '', resourceType, title, textContent = '', answer = '', solution = '', accessType = 'free', language = 'en' } = req.body;
    let canonicalDepartment = '';
    if (!['Natural', 'Social', 'Health', 'Diploma'].includes(stream) || !['Freshman', 'Remedial', 'Senior', 'Diploma'].includes(level)) return res.status(400).json({ message: 'Invalid stream or level.' });
    if (!['course-material', 'exam-question', 'exit-exam'].includes(kind)) return res.status(400).json({ message: 'Invalid content category.' });
    if (!['pdf', 'ppt', 'video', 'image', 'text'].includes(resourceType)) return res.status(400).json({ message: 'Invalid resource format.' });
    if (!['free', 'premium'].includes(accessType)) return res.status(400).json({ message: 'Choose Free or Premium access.' });
    if (!title || !String(title).trim()) return res.status(400).json({ message: 'Resource title is required.' });
    if (level === 'Senior' && !department) return res.status(400).json({ message: 'Senior resources require a department.' });
    if (level === 'Senior') {
      const departmentRecord = await resolveDepartment(stream, department);
      if (!departmentRecord) return res.status(400).json({ message: 'Select an active department from the selected academic category.' });
      canonicalDepartment = departmentRecord.name;
    }
    if (level !== 'Senior' && !course) return res.status(400).json({ message: 'This level requires a course.' });
    if (level === 'Senior' && kind === 'course-material' && !course) return res.status(400).json({ message: 'Senior course materials must be assigned to a department course.' });
    if (level === 'Senior' && kind === 'exam-question') return res.status(400).json({ message: 'Use Exit Exam for Senior assessment uploads.' });
    if (level !== 'Senior' && kind === 'exit-exam') return res.status(400).json({ message: 'Exit Exam is only available for Senior.' });
    const allowedFormats = kind === 'course-material' ? ['pdf', 'ppt', 'video'] : ['image', 'pdf', 'text'];
    if (!allowedFormats.includes(resourceType)) return res.status(400).json({ message: 'The selected file format does not match this learning content type.' });
    if (resourceType === 'text' && !String(textContent).trim()) return res.status(400).json({ message: 'Text content is required.' });
    if (resourceType !== 'text' && !req.file) return res.status(400).json({ message: 'Please select a file.' });
    if (req.file) {
      const extension = path.extname(req.file.originalname).toLowerCase();
      const validExtensions = { pdf: ['.pdf'], ppt: ['.ppt', '.pptx'], video: ['.mp4', '.webm', '.mov'], image: ['.png', '.jpg', '.jpeg'] };
      if (!validExtensions[resourceType]?.includes(extension)) return res.status(400).json({ message: 'The uploaded file extension does not match the selected resource format.' });
    }
    const storedFileName = req.file ? crypto.randomUUID() + path.extname(req.file.originalname).toLowerCase() : '';
    if (req.file) fs.writeFileSync(path.join(PRIVATE_DIR, storedFileName), req.file.buffer, { flag: 'wx' });
    const item = await UniversityResource.create({
      stream, level, language: ['am', 'amharic'].includes(String(language).trim().toLowerCase()) ? 'am' : 'en', department: canonicalDepartment, course, kind, academicYear: String(academicYear || '').trim() || 'All Years', resourceType, title: String(title).trim(),
      textContent, answer, solution, accessType, storedFileName,
      originalFileName: req.file?.originalname || '', mimeType: req.file?.mimetype || '',
      uploadedBy: req.user._id,
      status: 'approved',
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });
    return res.status(201).json({ message: 'Resource published successfully and is now visible to students.', resource: { id: item._id, status: item.status, accessType: item.accessType } });
  } catch (error) {
    console.error('University upload error:', error);
    return res.status(500).json({ message: 'Unable to save upload.' });
  }
};

exports.adminList = async (_req, res) => {
  try {
    const resources = await UniversityResource.find()
      .populate('uploadedBy', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });
    return res.json({ resources });
  } catch (error) {
    console.error('University admin list error:', error);
    return res.status(500).json({ message: 'Unable to load uploaded resources.' });
  }
};

exports.setApproval = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid approval status.' });
    const item = await UniversityResource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Resource not found.' });
    item.status = status;
    item.approvedBy = status === 'approved' ? req.user._id : null;
    item.approvedAt = status === 'approved' ? new Date() : null;
    await item.save();
    return res.json({ message: 'Approval status updated.', resource: item });
  } catch (error) {
    console.error('University approval update error:', error);
    return res.status(500).json({ message: 'Unable to update approval status.' });
  }
};

exports.setStudentAccess = async (req, res) => {
  try {
    const { userId, grant = true } = req.body;
    if (!userId) return res.status(400).json({ message: 'Student ID is required.' });
    const resource = await UniversityResource.findById(req.params.id);
    if (!resource || resource.status !== 'approved') return res.status(404).json({ message: 'Approved resource not found.' });
    const student = await User.findById(userId);
    if (!student || student.role === 'admin') return res.status(404).json({ message: 'Student account not found.' });
    if (grant) {
      await User.updateOne({ _id: student._id }, { $addToSet: { unlockedUniversityResources: resource._id }, $pull: { downloadApprovals: { resourceModel: 'UniversityResource', resourceId: resource._id } } });
      await User.updateOne({ _id: student._id }, { $push: { downloadApprovals: { resourceModel: 'UniversityResource', resourceId: resource._id, status: 'approved', approvedBy: req.user._id, approvedAt: new Date() } } });
    } else {
      await User.updateOne({ _id: student._id }, { $pull: { unlockedUniversityResources: resource._id, downloadApprovals: { resourceModel: 'UniversityResource', resourceId: resource._id } } });
    }
    return res.json({ message: grant ? 'Download access approved for this student.' : 'Download access revoked for this student.' });
  } catch (error) {
    console.error('University premium access update error:', error);
    return res.status(500).json({ message: 'Unable to update student access.' });
  }
};

exports.toggleResourcePremium = async (req, res) => {
  try {
    const item = await UniversityResource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Resource not found.' });
    const requested = req.body.accessType;
    if (requested !== undefined && !['free', 'premium'].includes(requested)) {
      return res.status(400).json({ message: 'Choose Free or Premium access.' });
    }
    item.accessType = requested || (item.accessType === 'premium' ? 'free' : 'premium');
    await item.save();
    return res.json({ message: item.accessType === 'premium' ? 'Resource marked Premium.' : 'Resource set to Free.', resource: item });
  } catch (error) {
    console.error('Toggle University resource premium error:', error);
    return res.status(500).json({ message: 'Unable to update resource access type.' });
  }
};

exports.downloadApproved = async (req, res) => {
  try {
    const item = await UniversityResource.findOne({ _id: req.params.id, status: 'approved' });
    if (!item) return res.status(404).json({ message: 'Approved resource not found.' });
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = (req.user?.unlockedUniversityResources || []).some((id) => String(id) === String(item._id));
    const isApproved = (req.user?.downloadApprovals || []).some((entry) => entry.resourceModel === 'UniversityResource' && String(entry.resourceId) === String(item._id) && entry.status === 'approved');
    if (req.query.download === '1' && !isAdmin && !isUnlocked && !isApproved) return res.status(403).json({ message: 'Administrator approval is required before downloading this resource.' });
    if (req.query.download !== '1' && item.accessType === 'premium' && !isAdmin && !isUnlocked && !isApproved) return res.status(403).json({ message: 'Administrator approval is required to view this premium resource.' });
    if (!item.storedFileName) return res.status(404).json({ message: 'This resource has no attached file.' });
    const filePath = path.join(PRIVATE_DIR, path.basename(item.storedFileName));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File is missing.' });
    res.type(item.mimeType || 'application/octet-stream');
    if (req.query.download === '1') return res.download(filePath, item.originalFileName || item.title);
    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) res.status(error.statusCode || 500).json({ message: 'Unable to deliver approved file.' });
    });
  } catch (error) {
    console.error('Approved University download error:', error);
    return res.status(500).json({ message: 'Unable to verify approved resource.' });
  }
};
