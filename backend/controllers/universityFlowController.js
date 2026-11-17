const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const UniversityResource = require('../models/UniversityResource');

const PRIVATE_DIR = path.join(__dirname, '../private_uploads/university');
fs.mkdirSync(PRIVATE_DIR, { recursive: true });

const approvedFilter = { status: 'approved' };

exports.getCatalog = async (req, res) => {
  try {
    const { stream, level, department, course, kind, academicYear } = req.query;
    if (!stream || !['Natural', 'Social'].includes(stream)) return res.status(400).json({ message: 'Choose Natural or Social stream.' });
    if (level && !['Freshman', 'Remedial', 'Senior'].includes(level)) return res.status(400).json({ message: 'Invalid academic level.' });
    if (!level) return res.json({ streams: ['Natural', 'Social'], levels: ['Freshman', 'Remedial', 'Senior'] });
    const base = { ...approvedFilter, stream, level };
    if (level === 'Senior' && !department) {
      const departments = await UniversityResource.distinct('department', { ...base, department: { $nin: ['', null] } });
      return res.json({ departments: departments.sort((a,b) => a.localeCompare(b)) });
    }
    if (level !== 'Senior' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, course: { $nin: ['', null] }, kind: { $in: ['course-material', 'exam-question'] } });
      return res.json({ courses: courses.sort((a,b) => a.localeCompare(b)) });
    }
    if (level === 'Senior' && department && !kind) {
      const kinds = await UniversityResource.distinct('kind', { ...base, department });
      return res.json({ options: [
        ...(kinds.includes('exit-exam') ? [{ id: 'exit-exam', label: 'Exit Exam' }] : []),
        ...(kinds.includes('course-material') ? [{ id: 'course-material', label: 'Course Material' }] : []),
      ] });
    }
    if (level === 'Senior' && department && kind === 'course-material' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, department, kind, course: { $nin: ['', null] } });
      return res.json({ courses: courses.sort((a,b) => a.localeCompare(b)) });
    }
    if (level !== 'Senior' && course && !kind) {
      const kinds = await UniversityResource.distinct('kind', { ...base, course });
      return res.json({ options: [
        ...(kinds.includes('exam-question') ? [{ id: 'exam-question', label: 'Exam Question' }] : []),
        ...(kinds.includes('course-material') ? [{ id: 'course-material', label: 'Course Material' }] : []),
      ] });
    }
    if (kind === 'exam-question' && !academicYear) {
      const years = await UniversityResource.distinct('academicYear', { ...base, course, kind, academicYear: { $nin: ['', null] } });
      return res.json({ years: years.sort() });
    }
    const query = { ...base };
    if (department) query.department = department;
    if (course) query.course = course;
    if (kind) query.kind = kind;
    if (academicYear) query.academicYear = String(academicYear);
    const resources = await UniversityResource.find(query)
      .select('title resourceType textContent answer solution originalFileName mimeType')
      .sort({ createdAt: -1 }).lean();
    return res.json({ resources });
  } catch (error) {
    console.error('University catalog error:', error);
    return res.status(500).json({ message: 'Unable to load approved learning content.' });
  }
};

exports.adminUpload = async (req, res) => {
  try {
    const { stream, level, department = '', course = '', kind, academicYear = '', resourceType, title, textContent = '', answer = '', solution = '' } = req.body;
    if (!['Natural', 'Social'].includes(stream) || !['Freshman', 'Remedial', 'Senior'].includes(level)) return res.status(400).json({ message: 'Invalid stream or level.' });
    if (!['course-material', 'exam-question', 'exit-exam'].includes(kind)) return res.status(400).json({ message: 'Invalid content category.' });
    if (!['pdf', 'ppt', 'video', 'image', 'text'].includes(resourceType)) return res.status(400).json({ message: 'Invalid resource format.' });
    if (!title || !String(title).trim()) return res.status(400).json({ message: 'Resource title is required.' });
    if (level === 'Senior' && !department) return res.status(400).json({ message: 'Senior resources require a department.' });
    if (level !== 'Senior' && !course) return res.status(400).json({ message: 'Freshman and Remedial resources require a course.' });
    if (kind === 'exam-question' && !academicYear) return res.status(400).json({ message: 'Exam academic year is required.' });
    if (resourceType === 'text' && !String(textContent).trim()) return res.status(400).json({ message: 'Text content is required.' });
    if (resourceType !== 'text' && !req.file) return res.status(400).json({ message: 'Please select a file.' });
    const storedFileName = req.file ? crypto.randomUUID() + path.extname(req.file.originalname).toLowerCase() : '';
    if (req.file) fs.writeFileSync(path.join(PRIVATE_DIR, storedFileName), req.file.buffer, { flag: 'wx' });
    const item = await UniversityResource.create({
      stream, level, department, course, kind, academicYear, resourceType, title: String(title).trim(),
      textContent, answer, solution, storedFileName,
      originalFileName: req.file?.originalname || '', mimeType: req.file?.mimetype || '',
      uploadedBy: req.user._id, status: 'pending',
    });
    return res.status(201).json({ message: 'Upload received and awaiting admin approval.', resource: { id: item._id, status: item.status } });
  } catch (error) {
    console.error('University upload error:', error);
    return res.status(500).json({ message: 'Unable to save upload.' });
  }
};

exports.adminList = async (_req, res) => {
  const resources = await UniversityResource.find().populate('uploadedBy', 'fullName email').populate('approvedBy', 'fullName email').sort({ createdAt: -1 });
  res.json({ resources });
};

exports.setApproval = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ message: 'Invalid approval status.' });
  const item = await UniversityResource.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Resource not found.' });
  item.status = status;
  item.approvedBy = status === 'approved' ? req.user._id : null;
  item.approvedAt = status === 'approved' ? new Date() : null;
  await item.save();
  res.json({ message: 'Approval status updated.', resource: item });
};

exports.downloadApproved = async (req, res) => {
  const item = await UniversityResource.findOne({ _id: req.params.id, status: 'approved' });
  if (!item) return res.status(404).json({ message: 'Approved resource not found.' });
  if (!item.storedFileName) return res.status(404).json({ message: 'This resource has no attached file.' });
  const filePath = path.join(PRIVATE_DIR, item.storedFileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File is missing.' });
  return res.sendFile(filePath);
};
