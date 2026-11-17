const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const controller = require('../controllers/universityFlowController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|ppt|pptx|mp4|webm|mov|png|jpg|jpeg)$/i.test(file.originalname);
    cb(allowed ? null : new Error('Unsupported file type.'), allowed);
  },
});

router.get('/catalog', controller.getCatalog);
router.get('/resources/:id/file', auth, controller.downloadApproved);
router.post('/admin/upload', auth, permit('admin'), upload.single('file'), controller.adminUpload);
router.get('/admin/resources', auth, permit('admin'), controller.adminList);
router.patch('/admin/resources/:id/approval', auth, permit('admin'), controller.setApproval);

module.exports = router;
