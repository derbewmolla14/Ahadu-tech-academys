const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const UniversityResource = require('../models/UniversityResource');
const Department = require('../models/Department');

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
      const category = stream === 'Natural' ? 'Natural Science' : 'Social Science';
      const departments = await Department.find({ category, isActive: true }).select('name').sort({ name: 1 }).lean();
      return res.json({ departments: departments.map((item) => item.name) });
    }
    if (level !== 'Senior' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, course: { $nin: ['', null] }, kind: { $in: ['course-material', 'exam-question'] } });
      return res.json({ courses: courses.sort((a,b) => a.localeCompare(b)) });
    }
    if (level === 'Senior' && department && !kind) {
      const kinds = await UniversityResource.distinct('kind', { ...base, department });
      return res.json({ options: [
        { id: 'exit-exam', label: 'Exit Exam' },
        { id: 'course-material', label: 'Course Material' },
      ] });
    }
    if (level === 'Senior' && department && kind === 'course-material' && !course) {
      const courses = await UniversityResource.distinct('course', { ...base, department, kind, course: { $nin: ['', null] } });
      return res.json({ courses: courses.sort((a,b) => a.localeCompare(b)) });
    }
    if (level !== 'Senior' && course && !kind) {
      const kinds = await UniversityResource.distinct('kind', { ...base, course });
      return res.json({ options: [
        { id: 'exam-question', label: 'Exam Question' },
        { id: 'course-material', label: 'Course Material' },
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
    if (level === 'Senior' && kind === 'course-material' && !course) return res.status(400).json({ message: 'Senior course materials must be assigned to a department course.' });
    if (level === 'Senior' && kind === 'exam-question') return res.status(400).json({ message: 'Use Exit Exam for Senior assessment uploads.' });
    if (level !== 'Senior' && kind === 'exit-exam') return res.status(400).json({ message: 'Exit Exam is only available for Senior.' });
    const allowedFormats = kind === 'course-material' ? ['pdf', 'ppt', 'video'] : ['image', 'pdf', 'text'];
    if (!allowedFormats.includes(resourceType)) return res.status(400).json({ message: 'The selected file format does not match this learning content type.' });
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

exports.downloadApproved = async (req, res) => {
  try {
    const item = await UniversityResource.findOne({ _id: req.params.id, status: 'approved' });
    if (!item) return res.status(404).json({ message: 'Approved resource not found.' });
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
