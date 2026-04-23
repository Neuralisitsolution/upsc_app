const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { submitAnswer, evaluateAnswerNow, getAnswers, getAnswer, getAnswerStats } = require('../controllers/answerController');

router.use(protect);
router.post('/', submitAnswer);
router.get('/stats', getAnswerStats);
router.get('/', getAnswers);
router.get('/:id', getAnswer);
router.post('/:id/evaluate', evaluateAnswerNow);

module.exports = router;
