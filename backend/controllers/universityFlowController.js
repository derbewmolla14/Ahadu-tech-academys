const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const UniversityResource = require('../models/UniversityResource');
const Department = require('../models/Department');
const User = require('../models/User');

const PRIVATE_DIR = path.join(__dirname, '../private_uploads/university');
fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const approvedFilter = { status: 'approved' };

const STREAM_CATEGORY = { Natural: 'Natural Science', Social: 'Social Science', Health: 'Health Science', Diploma: 'Diploma' };
const exactDepartmentRegex = (value) => new RegExp('^' + String(value || '').trim().replace(/[.*+?^()|[\]\\$]/g, (character) => '\\' + character) + '$', 'i');

const resolveDepartment = async (stream, departmentName) => {
  const category = STREAM_CATEGORY[stream];
  const name = String(departmentName || '').trim();
  if (!category || !name) return null;
  return Department.findOne({ category, name: { $regex: exactDepartmentRegex(name) }, isActive: true })
    .select('name normalizedName category').lean();
};

exports.getCatalog = async (req, res) => {
  try {
    const { stream, level, department, course, kind, academicYear } = req.query;
    if (!stream || !['Natural', 'Social', 'Health', 'Diploma'].includes(stream)) return res.status(400).json({ message: 'Choose a valid academic stream.' });
    if (level && !['Freshman', 'Remedial', 'Senior', 'Diploma'].includes(level)) return res.status(400).json({ message: 'Invalid academic level.' });
    if (!level) return res.json({ streams: ['Natural', 'Social', 'Health', 'Diploma'], levels: ['Freshman', 'Remedial', 'Senior', 'Diploma'] });
    const base = { ...approvedFilter, stream, level };
    let canonicalDepartment = '';
    if (level === 'Senior' && department) {
      const departmentRecord = await resolveDepartment(stream, department);
      if (!departmentRecord) return res.json({ courses: [], resources: [], message: 'No matching active department was found.' });
      canonicalDepartment = departmentRecord.name;
    }
    if (level === 'Senior' && !department) {
      const category = ({ Natural: 'Natural Science', Social: 'Social Science', Health: 'Health Science', Diploma: 'Diploma' })[stream];
      const departments = await Department.find({ category, isActive: true }).select('name').sort({ name: 1 }).lean();
      return res.json({ departments: departments.map((item) => item.name) });
    }
    if (level !== 'Senior' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, course: { $nin: ['', null] }, kind: { $in: ['course-material', 'exam-question'] } });
      return res.json({ courses: courses.sort((a, b) => a.localeCompare(b)) });
    }
    if (level === 'Senior' && department && !kind) {
      return res.json({ options: [
        { id: 'exit-exam', label: 'Exit Exam' },
        { id: 'course-material', label: 'Course Material' },
      ] });
    }
    if (level === 'Senior' && department && kind === 'course-material' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, department: { $regex: exactDepartmentRegex(canonicalDepartment) }, kind, course, kind, course: { $nin: ['', null] } });
      return res.json({ courses: courses.sort((a, b) => a.localeCompare(b)) });
    }
    if (level !== 'Senior' && course && !kind) {
      return res.json({ options: [
        { id: 'exam-question', label: 'Exam Question' },
        { id: 'course-material', label: 'Course Material' },
      ] });
    }
    const query = { ...base };
    if (department) query.department = { $regex: exactDepartmentRegex(level === 'Senior' ? canonicalDepartment : department) };
    if (course) query.course = course;
    if (kind) query.kind = kind;
    if (academicYear) query.$or = [{ academicYear: String(academicYear).trim() }, { academicYear: 'All Years' }, { academicYear: '' }, { academicYear: null }, { academicYear: { $exists: false } }];
    const resources = await UniversityResource.find(query)
      .select('title resourceType textContent answer solution originalFileName mimeType accessType')
      .sort({ createdAt: -1 }).lean();
    const unlocked = new Set((req.user?.unlockedUniversityResources || []).map((id) => String(id)));
    return res.json({
      resources: resources.map((item) => ({
        ...item,
        hasAccess: item.accessType !== 'premium' || req.user?.role === 'admin' || unlocked.has(String(item._id)),
      })),
    });
  } catch (error) {
    console.error('University catalog error:', error);
    return res.status(500).json({ message: 'Unable to load approved learning content.' });
  }
};

exports.adminUpload = async (req, res) => {
  try {
    const { stream, level, department = '', course = '', kind, academicYear = '', resourceType, title, textContent = '', answer = '', solution = '', accessType = 'free' } = req.body;
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
      stream, level, department: canonicalDepartment, course, kind, academicYear: String(academicYear || '').trim() || 'All Years', resourceType, title: String(title).trim(),
      textContent, answer, solution, accessType, storedFileName,
      originalFileName: req.file?.originalname || '', mimeType: req.file?.mimetype || '',
      uploadedBy: req.user._id, status: 'pending',
    });
    return res.status(201).json({ message: 'Upload received and awaiting admin approval.', resource: { id: item._id, status: item.status, accessType: item.accessType } });
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
    if (!resource || resource.accessType !== 'premium' || resource.status !== 'approved') return res.status(404).json({ message: 'Approved premium resource not found.' });
    const student = await User.findById(userId);
    if (!student || student.role === 'admin') return res.status(404).json({ message: 'Student account not found.' });
    if (grant) await User.updateOne({ _id: student._id }, { $addToSet: { unlockedUniversityResources: resource._id } });
    else await User.updateOne({ _id: student._id }, { $pull: { unlockedUniversityResources: resource._id } });
    return res.json({ message: grant ? 'Premium resource access granted to this student.' : 'Premium resource access revoked from this student.' });
  } catch (error) {
    console.error('University premium access update error:', error);
    return res.status(500).json({ message: 'Unable to update student access.' });
  }
};

exports.downloadApproved = async (req, res) => {
  try {
    const item = await UniversityResource.findOne({ _id: req.params.id, status: 'approved' });
    if (!item) return res.status(404).json({ message: 'Approved resource not found.' });
    const isAdmin = req.user?.role === 'admin';
    const isUnlocked = (req.user?.unlockedUniversityResources || []).some((id) => String(id) === String(item._id));
    if (item.accessType === 'premium' && !isAdmin && !isUnlocked) return res.status(403).json({ message: 'This is a premium resource. Please complete payment or request access before opening it.' });
    if (!item.storedFileName) return res.status(404).json({ message: 'This resource has no attached file.' });
    const filePath = path.join(PRIVATE_DIR, path.basename(item.storedFileName));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File is missing.' });
    res.type(item.mimeType || 'application/octet-stream');
    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) res.status(error.statusCode || 500).json({ message: 'Unable to deliver approved file.' });
    });
  } catch (error) {
    console.error('Approved University download error:', error);
    return res.status(500).json({ message: 'Unable to verify approved resource.' });
  }
};
