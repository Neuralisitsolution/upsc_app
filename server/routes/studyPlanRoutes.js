const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePlan, getActivePlan, getPlans, markDayComplete } = require('../controllers/studyPlanController');

router.use(protect);
router.post('/generate', generatePlan);
router.get('/active', getActivePlan);
router.get('/', getPlans);
router.post('/mark-complete', markDayComplete);

module.exports = router;
