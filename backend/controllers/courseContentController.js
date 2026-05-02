const CourseContent = require('../models/CourseContent');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
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
    const { university, department, year, course, description, notes, videos, ppts, questions, isActive } = req.body;

    // Validate required fields
    if (!university || !department || !year || !course) {
      return res.status(400).json({
        success: false,
        message: 'University, department, year, and course are required'
      });
    }

    // Parse JSON strings if they come as strings
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
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in notes, videos, ppts, or questions'
      });
    }

    // Handle file uploads for notes and ppts
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        // Determine if this is a note or ppt based on file type
        const isPpt = file.mimetype.includes('powerpoint') || file.mimetype.includes('presentation');
        if (isPpt && parsedPpts[index - parsedNotes.length]) {
          parsedPpts[index - parsedNotes.length].fileUrl = `/uploads/${file.filename}`;
        } else if (parsedNotes[index]) {
          parsedNotes[index].fileUrl = `/uploads/${file.filename}`;
        }
      });
    }

    // Find existing content or create new
    const existingContent = await CourseContent.findOne({
      university,
      department,
      year,
      course
    });

    let content;
    if (existingContent) {
      // Update existing content
      existingContent.description = description !== undefined ? description : existingContent.description;
      existingContent.notes = parsedNotes.length > 0 ? parsedNotes : existingContent.notes;
      existingContent.videos = parsedVideos.length > 0 ? parsedVideos : existingContent.videos;
      existingContent.ppts = parsedPpts.length > 0 ? parsedPpts : existingContent.ppts;
      existingContent.questions = parsedQuestions.length > 0 ? parsedQuestions : existingContent.questions;
      existingContent.isActive = isActive !== undefined ? isActive : existingContent.isActive;
      content = await existingContent.save();
    } else {
      // Create new content
      content = new CourseContent({
        university,
        department,
        year,
        course,
        description: description || '',
        notes: parsedNotes,
        videos: parsedVideos,
        ppts: parsedPpts,
        questions: parsedQuestions,
        isActive: isActive !== undefined ? isActive : true
      });
      await content.save();
    }

    res.status(200).json({
      success: true,
      message: existingContent ? 'Course content updated successfully' : 'Course content created successfully',
      data: content
    });

  } catch (error) {
    console.error('Upload content error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course content already exists for this combination'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while uploading content',
      error: error.message
    });
  }
};

// Get course content (public - only active courses)
const getContent = async (req, res) => {
  try {
    const { university, department, year, course } = req.query;

    // Build query object - only active courses for public access
    const query = { isActive: true };
    if (university) query.university = university;
    if (department) query.department = department;
    if (year) query.year = year;
    if (course) query.course = course;

    const content = await CourseContent.find(query);

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

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Course content not found'
      });
    }

    res.status(200).json({
      success: true,
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

module.exports = {
  upload,
  uploadContent,
  getContent,
  getContentById,
  deleteContent,
  getAllCourses,
  toggleCourseStatus,
  updateCourse
};