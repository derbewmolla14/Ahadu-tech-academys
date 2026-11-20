const express = require('express');
const auth = require('../middleware/auth');
const permit = require('../middleware/roles');
const controller = require('../controllers/referralController');

const router = express.Router();
router.get('/mine', auth, controller.getMine);
router.put('/payout', auth, controller.updatePayout);
router.get('/admin', auth, permit('admin'), controller.getAdminOverview);
router.patch('/admin/:userId/referrer', auth, permit('admin'), controller.assignReferrer);
router.post('/admin/:userId/payout', auth, permit('admin'), controller.recordPayout);
router.put('/admin/settings', auth, permit('admin'), controller.updateCommissionRates);
module.exports = router;
