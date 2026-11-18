const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const controller = require('../controllers/paymentPricingController');

const router = express.Router();

router.get('/', controller.getPublicPricing);
router.get('/admin', auth, permit('admin'), controller.getAdminPricing);
router.put('/admin', auth, permit('admin'), controller.updatePricing);

module.exports = router;
