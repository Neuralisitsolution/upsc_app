const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getQuestions, getQuestion, createQuestion, getDailyQuestion, getQuestionStats, deleteQuestion } = require('../controllers/questionController');

router.use(protect);
router.get('/daily', getDailyQuestion);
router.get('/stats', getQuestionStats);
router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', createQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
