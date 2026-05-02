const UniversityContent = require('../models/university/Content');

const sampleContent = {
  'cs101': {
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pptUrl: 'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt',
    notes: 'This course introduces core concepts such as algorithms, computers, and programming basics. Review the lecture video, then use the PDF and slides to study the material.',
  },
  'cs102': {
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pptUrl: 'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt',
    notes: 'Data structures are essential for organizing information. This content covers arrays, linked lists, stacks, queues, and trees.',
  },
  'bus101': {
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pptUrl: 'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_500kB.ppt',
    notes: 'Management principles help leaders build teams, set goals, and manage resources effectively.',
  },
};

exports.getContentByCourseId = async (req, res) => {
  const { courseId } = req.params;
  const content = await UniversityContent.findOne({}).lean().exec();
  if (content) return res.json(content);
  const fallback = sampleContent[courseId] || sampleContent[courseId.toLowerCase()];
  if (!fallback) return res.status(404).json({ message: 'Content not found' });
  return res.json(fallback);
};
